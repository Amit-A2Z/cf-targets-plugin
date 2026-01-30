/*
Copyright 2024 Norman Abramovitz and Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/json"
	"flag"
	"fmt"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	realos "os"

	"code.cloudfoundry.org/cli/cf/configuration"
	"code.cloudfoundry.org/cli/cf/configuration/confighelpers"
	"code.cloudfoundry.org/cli/cf/configuration/coreconfig"
	"code.cloudfoundry.org/cli/plugin"
	"github.com/Amit-A2Z/cf-targets-plugin/diff"
	"github.com/Amit-A2Z/cf-targets-plugin/diff/myers"
)

// There are three files that target plugin keeps track of
// config file is the file the cf-cli maintains directly.
// current file is the file the target plugin believes is the active file
//              and is normally a link to a target file.
// target files are files that have saved copies of the config file

type TargetsPlugin struct {
	configPath  string
	targetsPath string
	currentPath string
	suffix      string
	status      TargetStatus
}

type TargetStatus struct {
	currentHasName     bool
	currentName        string
	currentNeedsSaving bool
	currentNeedsUpdate bool
}

type RealOS struct{}
type OS interface {
	Exit(int)
	Mkdir(string, realos.FileMode)
	Remove(string)
	Symlink(string, string) error
	ReadDir(string) ([]realos.DirEntry, error)
	ReadFile(string) ([]byte, error)
	WriteFile(string, []byte, realos.FileMode) error
}

func (*RealOS) Exit(code int)                                  { realos.Exit(code) }
func (*RealOS) Mkdir(path string, mode realos.FileMode)        { realos.Mkdir(path, mode) }
func (*RealOS) Remove(path string)                             { realos.Remove(path) }
func (*RealOS) Symlink(target string, source string) error     { return realos.Symlink(target, source) }
func (*RealOS) ReadDir(path string) ([]realos.DirEntry, error) { return realos.ReadDir(path) }
func (*RealOS) ReadFile(path string) ([]byte, error)           { return realos.ReadFile(path) }
func (*RealOS) WriteFile(path string, content []byte, mode realos.FileMode) error {
	return realos.WriteFile(path, content, mode)
}

var os OS
var SemVerMajor string
var SemVerMinor string
var SemVerPatch string
var SemVerPrerelease string
var SemVerBuild string
var BuildDate string
var BuildVcsUrl string
var BuildVcsId string
var BuildVcsIdDate string
var GoArch string
var GoOs string

// logWithTimestamp logs a message with UTC timestamp
func logWithTimestamp(level, message string) {
	timestamp := time.Now().UTC().Format("2006-01-02T15:04:05Z")
	fmt.Printf("[%s] %s: %s\n", timestamp, level, message)
}

// logInfo logs an info message with UTC timestamp
func logInfo(message string) {
	logWithTimestamp("INFO", message)
}

// logError logs an error message with UTC timestamp
func logError(message string) {
	logWithTimestamp("ERROR", message)
}

// logWarn logs a warning message with UTC timestamp
func logWarn(message string) {
	logWithTimestamp("WARN", message)
}

func getVersion(version, toInt string) int {
	theInt, err := strconv.Atoi(toInt)
	if err != nil {
		theInt = 0
		logWarn(fmt.Sprintf("Invalid %s version value, defaulting to zero: %v", version, err))
	}
	return theInt
}

func newTargetsPlugin() *TargetsPlugin {
	configPath, _ := confighelpers.DefaultFilePath()
	targetsPath := filepath.Join(filepath.Dir(configPath), "targets")
	os.Mkdir(targetsPath, 0700)
	return &TargetsPlugin{
		configPath:  configPath,
		targetsPath: targetsPath,
		currentPath: filepath.Join(targetsPath, "current"),
		suffix:      "." + filepath.Base(configPath),
	}
}

func (c *TargetsPlugin) GetMetadata() plugin.PluginMetadata {
	return plugin.PluginMetadata{
		Name: "cf-targets",
		Version: plugin.VersionType{
			Major: getVersion("major", SemVerMajor),
			Minor: getVersion("minor", SemVerMinor),
			Build: getVersion("patch", SemVerPatch),
		},
		Commands: []plugin.Command{
			{
				Name:     "targets",
				HelpText: "List available targets",
				UsageDetails: plugin.Usage{
					Usage: "cf targets",
				},
			},
			{
				Name:     "set-target",
				HelpText: "Set current target",
				UsageDetails: plugin.Usage{
					Usage: "cf set-target [-f] NAME",
					Options: map[string]string{
						"f": "replace the current target even if it has not been saved",
					},
				},
			},
			{
				Name:     "save-target",
				HelpText: "Save current target",
				UsageDetails: plugin.Usage{
					Usage: "cf save-target [-f] [NAME]",
					Options: map[string]string{
						"f": "save the target even if the specified name already exists",
					},
				},
			},
			{
				Name:     "delete-target",
				HelpText: "Delete a saved target",
				UsageDetails: plugin.Usage{
					Usage: "cf delete-target NAME",
				},
			},
		},
	}
}

func createBuildMeta(buildOs, buildArch, build string) string {
	p1 := strings.TrimSpace(buildOs)
	p2 := strings.TrimSpace(buildArch)
	p3 := strings.TrimSpace(build)
	if p1 == "" || p2 == "" {
		panic(fmt.Sprintf("Go meta data is missing one of its parts: %s, %s ", p1, p2))
	}
	b := strings.Join([]string{p1, p2}, ".")
	if p3 != "" {
		b += "." + p3
	}
	return b
}

func createSemVer(major, minor, patch, prerelease, build string) string {
	p1 := strings.TrimSpace(major)
	p2 := strings.TrimSpace(minor)
	p3 := strings.TrimSpace(patch)
	p4 := strings.TrimSpace(prerelease)
	p5 := strings.TrimSpace(build)
	if p1 == "" || p2 == "" || p3 == "" {
		panic(fmt.Sprintf("Semanic version is missing one of its parts: %s.%s.%s", p1, p2, p3))
	}

	sv := strings.Join([]string{p1, p2, p3}, ".")
	if p4 != "" {
		sv += "-" + p4
	}
	if p5 != "" {
		sv += "+" + p5
	}
	return sv
}

func main() {
	args := realos.Args[1:]
	if len(args) == 0 {
		bm := createBuildMeta(GoOs, GoArch, SemVerBuild)
		sv := createSemVer(SemVerMajor, SemVerMinor, SemVerPatch, SemVerPrerelease, bm)
		fmt.Printf("cf-targets-plugin version %s\n", sv)
		fmt.Printf("This cf CLI plugin is not intended to be run on its own\n")
		realos.Exit(1)
	}
	os = &RealOS{}
	plugin.Start(newTargetsPlugin())
}

func (c *TargetsPlugin) Run(cliConnection plugin.CliConnection, args []string) {
	defer func() {
		reason := recover()
		if code, ok := reason.(int); ok {
			os.Exit(code)
		} else if reason != nil {
			panic(reason)
		}
	}()

	c.checkStatus()
	if args[0] == "targets" {
		c.TargetsCommand(args)
	} else if args[0] == "set-target" {
		c.SetTargetCommand(args)
	} else if args[0] == "save-target" {
		c.SaveTargetCommand(args)
	} else if args[0] == "delete-target" {
		c.DeleteTargetCommand(args)
	}
}

func createRedaction(jsonMap map[string]interface{}, key string) string {
	var valueAssertion interface{}
	valueAssertion = jsonMap[key]
	currentSum := sha256.Sum256([]byte(valueAssertion.(string)))
	return fmt.Sprintf("REDACTED sha256(%x)", currentSum)
}

func (c *TargetsPlugin) showDiff(targetPath string) {
	var json_data_current map[string]interface{}
	var json_data_target map[string]interface{}
	var err error

	currentContent, err := os.ReadFile(c.currentPath)
	c.checkError(err)
	targetContent, err := os.ReadFile(targetPath)
	c.checkError(err)
	err = json.Unmarshal(currentContent, &json_data_current)
	c.checkError(err)
	err = json.Unmarshal(targetContent, &json_data_target)
	c.checkError(err)

	json_data_current["AccessToken"] = createRedaction(json_data_current, "AccessToken")
	json_data_target["AccessToken"] = createRedaction(json_data_target, "AccessToken")

	json_data_current["RefreshToken"] = createRedaction(json_data_current, "RefreshToken")
	json_data_target["RefreshToken"] = createRedaction(json_data_target, "RefreshToken")

	json_data_current["UAAOAuthClientSecret"] = createRedaction(json_data_current, "UAAOAuthClientSecret")
	json_data_target["UAAOAuthClientSecret"] = createRedaction(json_data_target, "UAAOAuthClientSecret")

	current, err := json.MarshalIndent(json_data_current, "", " ")
	c.checkError(err)
	target, err := json.MarshalIndent(json_data_target, "", " ")
	c.checkError(err)

	edits := myers.ComputeEdits(string(current), string(target))
	if len(edits) != 0 {
		udiff, err := diff.ToUnified("Current", "Target", string(current), edits, 0)
		c.checkError(err)
		fmt.Println(udiff)
	} else {
		fmt.Println("hmmm no differences")
	}

}

func (c *TargetsPlugin) TargetsCommand(args []string) {
	if len(args) != 1 {
		c.exitWithUsage("targets")
	}
	targets := c.getTargets()
	if len(targets) < 1 {
		fmt.Println("No targets have been saved yet. To save the current target, use:")
		fmt.Println("   cf save-target NAME")
	} else {
		for _, target := range targets {
			var qualifier string
			if c.isCurrent(target) {
				qualifier = "(current"
				if c.status.currentNeedsSaving {
					qualifier += ", modified"
				} else if c.status.currentNeedsUpdate {
					qualifier += "*"
				}
				qualifier += ")"
			}
			fmt.Println(target, qualifier)
		}
	}
}

func (c *TargetsPlugin) SetTargetCommand(args []string) {
	flagSet := flag.NewFlagSet("set-target", flag.ContinueOnError)
	force := flagSet.Bool("f", false, "force")
	err := flagSet.Parse(args[1:])
	if err != nil || len(flagSet.Args()) != 1 {
		c.exitWithUsage("set-target")
	}
	targetName := flagSet.Arg(0)
	targetPath := c.targetPath(targetName)
	if !c.targetExists(targetPath) {
		logError(fmt.Sprintf("Target '%s' does not exist", targetName))
		panic(1)
	}
	if *force || !c.status.currentNeedsSaving {
		c.copyContents(targetPath, c.configPath)
		c.linkCurrent(targetPath)
	} else {
		logInfo("Your current target has not been saved. Use save-target first, or use -f to discard your changes.")
		c.showDiff(targetPath)
		panic(1)
	}
	logInfo(fmt.Sprintf("Set target to %s", targetName))
}

func (c *TargetsPlugin) SaveTargetCommand(args []string) {
	flagSet := flag.NewFlagSet("save-target", flag.ContinueOnError)
	force := flagSet.Bool("f", false, "force")
	err := flagSet.Parse(args[1:])
	if err != nil || len(flagSet.Args()) > 1 {
		c.exitWithUsage("save-target")
	}
	if len(flagSet.Args()) < 1 {
		c.SaveCurrentTargetCommand(*force)
	} else {
		c.SaveNamedTargetCommand(flagSet.Arg(0), *force)
	}
}

func (c *TargetsPlugin) SaveNamedTargetCommand(targetName string, force bool) {
	targetPath := c.targetPath(targetName)
	if force || !c.targetExists(targetPath) {
		c.copyContents(c.configPath, targetPath)
		c.linkCurrent(targetPath)
	} else {
		logError(fmt.Sprintf("Target '%s' already exists. Use -f to overwrite it.", targetName))
		panic(1)
	}
	logInfo(fmt.Sprintf("Saved current target as %s", targetName))
}

func (c *TargetsPlugin) SaveCurrentTargetCommand(force bool) {
	if !c.status.currentHasName {
		logError("Current target has not been previously saved. Please provide a name.")
		panic(1)
	}
	targetName := c.status.currentName
	targetPath := c.targetPath(targetName)
	if c.status.currentNeedsSaving && !force {
		logWarn("You've made substantial changes to the current target.")
		logInfo(fmt.Sprintf("Use -f if you intend to overwrite the target named %s or provide an alternate name", targetName))
		c.showDiff(c.configPath)
		panic(1)
	}
	c.copyContents(c.configPath, targetPath)
	logInfo(fmt.Sprintf("Saved current target as %s", targetName))
}

func (c *TargetsPlugin) DeleteTargetCommand(args []string) {
	if len(args) != 2 {
		c.exitWithUsage("delete-target")
	}
	targetName := args[1]
	targetPath := c.targetPath(targetName)
	if !c.targetExists(targetPath) {
		logError(fmt.Sprintf("Target '%s' does not exist", targetName))
		panic(1)
	}
	os.Remove(targetPath)
	if c.isCurrent(targetName) {
		os.Remove(c.currentPath)
	}
	logInfo(fmt.Sprintf("Deleted target %s", targetName))
}

func (c *TargetsPlugin) getTargets() []string {
	var targets []string
	files, _ := os.ReadDir(c.targetsPath)
	for _, file := range files {
		filename := file.Name()
		if strings.HasSuffix(filename, c.suffix) {
			targets = append(targets, strings.TrimSuffix(filename, c.suffix))
		}
	}
	return targets
}

func (c *TargetsPlugin) targetExists(targetPath string) bool {
	target := configuration.NewDiskPersistor(targetPath)
	return target.Exists()
}

/*
1. current file exists
2. current file is a symlink
3. target file of the symlink exists
4. target file matches the current file
*/

func (c *TargetsPlugin) checkStatus() {
	currentConfig := configuration.NewDiskPersistor(c.configPath)
	currentTarget := configuration.NewDiskPersistor(c.currentPath)
	if !currentTarget.Exists() {
		os.Remove(c.currentPath)
		c.status = TargetStatus{false, "", true, false}
		return
	}

	name := c.getCurrent()

	configData := coreconfig.NewData()
	targetData := coreconfig.NewData()

	err := currentConfig.Load(configData)
	c.checkError(err)
	err = currentTarget.Load(targetData)
	c.checkError(err)

	// Ignore the access-token field, as it changes frequently
	needsUpdate := targetData.AccessToken != configData.AccessToken
	targetData.AccessToken = configData.AccessToken

	currentContent, err := configData.JSONMarshalV3()
	c.checkError(err)
	savedContent, err := targetData.JSONMarshalV3()
	c.checkError(err)
	c.status = TargetStatus{true, name, !bytes.Equal(currentContent, savedContent), needsUpdate}
}

func (c *TargetsPlugin) copyContents(sourcePath, targetPath string) {
	content, err := os.ReadFile(sourcePath)
	c.checkError(err)
	err = os.WriteFile(targetPath, content, 0600)
	c.checkError(err)
}

func (c *TargetsPlugin) linkCurrent(targetPath string) {
	os.Remove(c.currentPath)
	err := os.Symlink(targetPath, c.currentPath)
	c.checkError(err)
}

func (c *TargetsPlugin) targetPath(targetName string) string {
	return filepath.Join(c.targetsPath, targetName+c.suffix)
}

func (c *TargetsPlugin) checkError(err error) {
	if err != nil {
		logError(fmt.Sprintf("Operation failed: %v", err))
		panic(1)
	}
}

func (c *TargetsPlugin) exitWithUsage(command string) {
	metadata := c.GetMetadata()
	for _, candidate := range metadata.Commands {
		if candidate.Name == command {
			fmt.Println("Usage: " + candidate.UsageDetails.Usage)
			panic(1)
		}
	}
}

func (c *TargetsPlugin) getCurrent() string {
	targetPath, err := filepath.EvalSymlinks(c.currentPath)
	c.checkError(err)
	return strings.TrimSuffix(filepath.Base(targetPath), c.suffix)
}

func (c *TargetsPlugin) isCurrent(target string) bool {
	return c.status.currentHasName && c.status.currentName == target
}

package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
	"github.com/yugabyte/yugabyte-db/managed/yba-installer/common"
)

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version of YBA Installer.",
	Args:  cobra.NoArgs,
	Long: `
    The version will be the same as the version of YugabyteDB Anywhere that you will be
	installing when you involve the yba-ctl binary using the install command line option.`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println(common.GetVersion())
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}

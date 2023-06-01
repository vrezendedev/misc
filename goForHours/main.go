package main

import (
	"context"
	"embed"
	procs "goForHours/services/procs"
	procsDal "goForHours/services/procsDal"
	"goForHours/services/tasks"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {

	tasks.VerifyAndCreateTask()

	app := NewApp()
	proc := procs.NewProcs()
	pD := procsDal.NewProcsDal()

	err := wails.Run(&options.App{
		Title:         "Go For Hours",
		Width:         1366,
		Height:        768,
		DisableResize: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 30, G: 24, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			app.SetContext(ctx)
			proc.SetContext(ctx)
			pD.SetContext(ctx)
		},
		OnShutdown: func(ctx context.Context) {
			pD.CloseDatabase()
		},
		Bind: []interface{}{
			app,
			proc,
			pD,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

package main

import (
	"context"
	"embed"
	procs "goForHours/services/procs"
	procsDal "goForHours/services/procsDal"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()
	proc := procs.NewProcs()
	pD := procsDal.NewProcsDal()

	// Create application with options
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

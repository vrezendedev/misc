package main

import (
	"bytes"
	"fmt"
	"image"
	"image/bmp"
	_ "image/bmp"
	"image/png"
	_ "image/png"
	"os"
	"path/filepath"
	"sync"
)

func main() {

	type coords []int
	type allCoords []coords

	const SPRITE_SIZE int = 16
	const TARGET_IMAGE = "sprites.png"

	extension := filepath.Ext(TARGET_IMAGE)

	if extension != ".bmp" && extension != ".png" {
		fmt.Println(extension)
		fmt.Println("File extension invalid.")
		os.Exit(1)
	}

	var wg sync.WaitGroup
	data, err := os.Open(TARGET_IMAGE)

	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	defer data.Close()

	img, _, err := image.Decode(data)

	if err != nil {
		fmt.Println("Error: ", err)
		os.Exit(1)
	}

	imgHeight := img.Bounds().Dy()
	imgWidth := img.Bounds().Dx()
	index := 0
	for i := 0; i < imgWidth; i += SPRITE_SIZE {
		for j := 0; j < imgHeight; j += SPRITE_SIZE {
			index++
			wg.Add(1)
			go func(vI int, vJ int, image image.Image, sizeSprite int, idx int, fileExtension string) {
				defer wg.Done()
				BuildImage(vI, vJ, image, sizeSprite, idx, fileExtension)
			}(i, j, img, SPRITE_SIZE, index, extension)
		}
	}

	wg.Wait()
	fmt.Println("Done! ")
}

func BuildImage(maxWidth int, maxHeight int, targetImage image.Image, spriteSize int, idx int, flExtension string) {
	sprite := image.NewRGBA(image.Rectangle{Max: image.Point{X: spriteSize, Y: spriteSize}})
	x := 0
	y := 0

	for x < spriteSize {
		y = 0
		for y < spriteSize {
			color := targetImage.At(x+maxWidth, y+maxHeight)
			sprite.Set(x, y, color)
			y++
		}
		x++
	}

	buff := new(bytes.Buffer)

	if flExtension == ".bmp" {
		bmp.Encode(buff, sprite)
	} else if flExtension == ".png" {
		png.Encode(buff, sprite)
	}

	os.WriteFile("output/"+"Image"+fmt.Sprint(idx)+""+flExtension, buff.Bytes(), 0666)
}

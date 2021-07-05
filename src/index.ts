import fs from "fs"
import path from "path"
import sharp from "sharp"

import quotes from "./quotes.json"

const bgFolder = path.resolve(__dirname, "../assets/img/background")
const quoteFolder = path.resolve(__dirname, "../assets/img/quote")
const w = 700
const h = 700

;(async () => {
    const bg = getRandomBackground()
    const quote = getRandomQuote()

    await createQuote(bg, quote.text, w, h)
})().catch((err: any) => {
    console.error(err)
})

async function createQuote(bg: string, quote: string, w: number, h: number) {
    const svg = getSvg(quote, w, h)
    const background = path.normalize(`${bgFolder}\\${bg}`)

    await sharp(background)
        .resize(w, h, {
            fit: "contain",
        })
        .composite([
            {
                input: Buffer.from(svg),
                gravity: "center",
            },
        ])
        .jpeg()
        .toFile(path.normalize(`${quoteFolder}\\quote1.jpg`))
}

function getRandomBackground() {
    const files = fs.readdirSync(bgFolder)

    if (!files) {
        console.error(`Failed to load files from ${bgFolder}`)
    }

    const randomIndex = Math.floor(Math.random() * files.length)
    const bg = files[randomIndex]

    return bg
}

function getRandomQuote() {
    if (!quotes) {
        console.error(`Failed to load quotes`)
    }

    const randomIndex = Math.floor(Math.random() * quotes.length)
    const quote = quotes[randomIndex]

    return quote
}

function getSvg(text: string, width: number, height: number) {
    const w = width.toString()
    const h = height.toString()

    const fontSize = getFontSize(text)
    const tx = (width / 2).toString()
    const ty = (height / 2).toString()
    const spacing = 3
    // const quote = wrapText(text, 30)

    // const texts = text.split(" ")
    const texts = "Goodmorning eveyone \n today is a new day \n go get it!".split("\n ")
    // pass array of texts, and optional line gap (default is 10) into getPositioning, it returns each line with their y position
    const textPositioning = getPositioning(texts)

    const svg = `
        <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" text-anchor="middle">

            <style type="text/css">
                svg {
                    font-family: serif;
                    fill: white;
                }
                text {
                    font-size: 30;
                }
                rect {
                    fill: black;
                    opacity: 0.4;
                }
            </style>

            <rect width="100%" height="100%"></rect>

            <text>
            ${
                textPositioning.map(textPosition => {
                    const {text, position} = textPosition
                    return `<tspan x="50%" y="${position}%" dy="1em">${text}</tspan>`
                })
            }
            </text>

        </svg>
    `

    return svg
}

function getFontSize(text: string) {
    let fontSize = 45
    const resizeHeuristic = 0.9
    const resizeActual = 0.985
    let l = text.length
    while (l > 1) {
        l = l * resizeHeuristic
        fontSize = fontSize * resizeActual

        return fontSize.toFixed(1)
    }
}

function getPositioning(texts: string[], lineGap?: number): TextPosition[] {
    const textPositions: TextPosition[] = []
    const middleIndex = Math.ceil(texts.length / 2)
    const gap = lineGap ? lineGap : 10

    texts.forEach((text, index) => {
        const distanceFromMiddleIndex = (middleIndex - index) - 1
        let position = 0
        if(distanceFromMiddleIndex > 0) {
            position = 50 - (gap*(distanceFromMiddleIndex))
        } else if(distanceFromMiddleIndex === 0) {
            position = 50
        } else {
            position = 50 + (gap*-(distanceFromMiddleIndex))
        }
        textPositions.push({text, position})
    })
    return textPositions
}

interface TextPosition {
    text: string
    position: number
}

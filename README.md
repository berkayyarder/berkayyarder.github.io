# berkayyarder.com

Personal portfolio of Muhammed Berkay Yarder, Technical Computer Science student at the University of Twente. I work on embedded systems, edge AI and real-time software.

**Live site:** [berkayyarder.com](https://berkayyarder.com)

## What's on it

- **Home:** a short intro, a logic analyser capture of my name sent over UART (you can measure it and send your own text), the projects, skills and contact.
- **Project pages:** one per project, each with a sketch of how the system works, what my part was, and a small interactive demo.

| Page | Project | Demo |
|---|---|---|
| `edge-ai.html` | Edge AI ecological monitoring system (Raspberry Pi 5 + Hailo-10H) | Threat rule: threshold and frames in a row |
| `am-demodulator.html` | AM demodulator for a maze robot (Smart Technology Hackathon) | Envelope detector with an adjustable capacitor |
| `fpga-sobel.html` | FPGA Sobel accelerator and stack processor (Clash, Verilog) | Draw on a grid and see the Sobel edges |
| `cabin-scheduling.html` | Rate Monotonic scheduling for aircraft cabin monitoring | Schedule simulator with the utilisation bound |
| `inter-actief.html` | Tutoring platform for Inter-Actief (Best Project Award) | Tutor search with filters |
| `basketball-coach.html` | Basketball shot coaching app (Vue.js, MediaPipe) | Elbow and knee angle check |
| `frc-drive.html` | FRC robot swerve drive | Swerve kinematics |

- **About:** background, experience, education and languages.

## How it's built

Plain HTML, CSS and a little JavaScript. No framework and no build step, so every file in this repository is exactly what the browser gets.

- `style.css`: all styling
- `site.js`: phone menu and the UART capture on the home page
- `demos.js`: the interactive demos on the project pages
- Images, the FRC video and `cv.pdf` sit next to the pages

Hosted on GitHub Pages with a custom domain.

## Credits

- Fonts: [Atkinson Hyperlegible Next and Mono](https://www.brailleinstitute.org/freefont/) by the Braille Institute, loaded through [Fontsource](https://fontsource.org)
- Skill icons: [Simple Icons](https://simpleicons.org), loaded from jsDelivr
- Project screenshots and photos are from the projects themselves, made with my teammates

## Contact

[mberkayyarder@gmail.com](mailto:mberkayyarder@gmail.com)

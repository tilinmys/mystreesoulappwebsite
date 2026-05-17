# Skills Setup Guide

When starting a new session on this project, install all required skills before writing any code.

Run `npx skills add emilkowalski/skill` to install Emil Kowalski's animation skill, which teaches proper easing, spring physics, and GPU-accelerated motion — use it when working on any animated component by prompting "use the emil skill."

Run `npx skills add pbakaus/impeccable` to install Impeccable, which provides 23 design slash commands — run `/impeccable polish` before shipping any screen, `/impeccable critique` for UX review, and `/impeccable audit` for accessibility and spacing issues.

Run `npx skills add Leonxlnx/taste-skill` to install the Taste skill, which sets the aesthetic foundation and prevents generic AI output like purple-to-blue gradients, Inter on everything, and flat cardUI — this runs automatically on every frontend prompt.

Run `npx skills add heygen-com/hyperframes` to install HyperFrames by HeyGen, which enables motion graphics and video rendering — use `/hyperframes` to create product demos, animated infographics, social content videos, and looping animations exported as MP4.

After installing all four, run `/teach-impeccable` once inside Claude Code so it learns the project's brand context, color palette, and design tone — every Impeccable command will use this context automatically from that point forward.

The full skill library will be stored in `.agents/skills/` and symlinked to Claude Code automatically.

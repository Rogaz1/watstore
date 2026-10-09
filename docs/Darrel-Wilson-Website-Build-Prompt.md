# Darrel Wilson — Website Build Prompt

Version 2 — implementation and review requirements refined.

Work as a combined web designer, creative director, and developer. Deliver a functioning website with its visual media and scroll-driven animation implemented. Shape the business narrative through coordinated imagery, movement, typography, and editable content.

Generate new images and videos through Higgsfield MCP. Continue inside the existing conversation and project. Do not move the work to another conversation or quietly replace Higgsfield generation with browser automation or a different media provider. This provider restriction does not prohibit permitted browser inspection of references or testing the completed site. Instructions inside a skill do not grant access to tools: confirm that the required image and video operations are actually callable before committing to generate anything. If access is incomplete, explain the specific missing capability once, request only the action needed to resolve it, and advance any work that does not depend on it. Avoid repeatedly suggesting that the user reinstall a plugin that is already connected.

Within this brief, resolve tradeoffs in this order: accurate business information and supplied identity; usable content and working visitor actions; accessible, responsive, reliable delivery; visual polish and motion complexity. Preserve the scroll-story objective, but simplify its execution when necessary to meet the earlier priorities. Disclose any unmet requirement instead of silently treating a fallback as the finished animation.

Before adding dependencies or generating media, inspect the current project's instructions, framework, routes, components, build commands, available assets, and hosting configuration. Reuse the existing stack. Do not replace the app or add a second publishing workflow to implement this brief.

## 1. Understand the business and choose a working mode

Begin with the information already available in the conversation and attachments. Ask a question only when its answer would substantially influence the website. If essential context is absent, gather it in one short intake covering:

- The business offering, intended audience, and main action visitors should take.
- The business name and any existing logo or brand materials.
- Reference websites, example visuals, or the desired look and feel.

Do not ask for information the user has supplied. A brief description of the business is sufficient to start; request additional detail only when a concrete decision requires it. Avoid turning intake into a comprehensive branding exercise.

Use the appropriate collaboration mode:

Default to autonomous execution for a direct build request unless the user asks to review stages or an unresolved factual dependency requires their input. Identify the mode in one sentence. Creative assumptions may be made; missing prices, payment destinations, credentials, or business claims may not be guessed.

**Guided collaboration:** Introduce a few useful checkpoints, particularly for the visual identity and scroll narrative. Give the user tangible directions to react to instead of repeatedly asking broad aesthetic questions. Proceed once they select a direction.

**Autonomous or template creation:** When the user asks you to choose, assume details, build a template, or otherwise proceed independently, make sensible choices and finish without pausing for design decisions. Develop coherent draft content when final copy is unavailable. Make that content simple to replace and document your assumptions in the delivery notes.

Keep supplied business facts accurate. Never invent reviews, clients, awards, locations, years of experience, completed-project totals, or other claims intended to establish trust. Identify fictional businesses and demonstration content clearly. Use practical placeholders for details that require real information.

Define the primary visitor action and its destination before designing the hero. Build the page around an understandable offer and that action. If the destination is unavailable, use an honest demo state or identify the missing integration; never create a button that falsely implies a working purchase, booking, or submission. Establish whether the task covers a landing page or additional routes so a visual build does not silently expand into a full commerce platform.

## 2. Define the identity and build a style tile

Treat supplied logos and official brand files as authoritative assets. Separate those assets from examples used only for inspiration. Preserve an existing logo rather than drawing a replacement to suit your preferred design.

Apply the same preservation rule to actual product photographs, packaging, labels, and product names. Use supplied originals for product listings. Generated scenes may illustrate the product, but inspect likeness and do not invent variants, distort packaging, or replace a real catalog with fictional products.

If no identity exists, develop a small number of relevant directions. Generate any needed logo concepts with Higgsfield MCP. In guided mode, present a concise choice; in autonomous mode, select the best fit and proceed. Obtain an editable vector master when the available model can produce one. Do not describe a raster image as an SVG master.

Open and inspect reference websites before making claims about their appearance. Identify the useful design choices: type, spacing, contrast, layout, surface treatment, components, and motion. Component references may guide construction, but do not reproduce proprietary branding or distinctive artwork wholesale.

When no references are provided, derive a consistent aesthetic from the offering and the user's description. Choose a design suited to this business instead of applying the same layout to every project.

Create a compact **style tile** built from the design tokens that the website will actually use. Show:

- The selected logo and color palette.
- Heading and body typography.
- Buttons and text links.
- A representative card or service block.
- The intended imagery treatment.

An editable HTML/CSS board that can be opened beside the website is preferred. Its purpose is to demonstrate the design system; it is not a completed homepage screenshot or a full brand manual.

Make the chosen direction observable: name the intended mood, type hierarchy, spacing rhythm, image treatment, and one distinctive visual idea tied to the offering. Avoid arbitrary decorations that do not support that direction. Use shared tokens for the board and website rather than maintaining two independent sets of styles.

Apply the same identity to the board, media, and final site. Retain chosen source files, generation prompts, and the reasons for selecting them. If an installed brand-production skill applies, use its preservation and production guidance without unnecessarily expanding the project into a brandbook.

## 3. Plan the visual narrative and its scroll behavior

Turn the offering into a concise visual progression. Each movement should help explain the product, process, service, or customer experience.

Before producing story media, present a table titled **Visual Story**. Use exactly the column labels **Scene**, **Visual story**, and **Website copy**. Pair each meaningful visual event with draft copy and appropriate calls to action. Make the proposal specific to the business. Three scenes will often be sufficient; add more only when the narrative requires them.

Use this format, replacing the example descriptions with the proposed scenes:

### Visual Story

| Scene | Visual story | Website copy |
| --- | --- | --- |
| 01 — Introduction | Introduce the central subject, its initial movement, and a composition with room for text. | Proposed opening headline, short explanation, and primary CTA. |
| 02 — Progression | Carry the subject into the next relevant action, feature, or detail. | Proposed product or service message, supporting text, and an action if useful. |
| 03 — Conclusion | Complete the movement with a final reveal, result, or destination. | Proposed outcome message, essential business details, and final CTA. |

Below the table, explain the connections between scenes and when their HTML copy appears, remains visible, and leaves. Identify readable text positions that avoid obscuring the action. Do not equate a second of footage with a second of scrolling. Allocate sufficient scroll travel for reading and let significant visual moments pause where useful.

### Choreograph transitions and allocate scroll travel

Give the intervals between content scenes the same attention as the main scenes. Where useful, add a separate **transition beat** in which the starting environment disappears, the moving subject appears alone, and the destination remains concealed until its intended reveal.

If the story calls for that staged reveal, do not leave the origin, traveling object, and destination visible together throughout the clip. Plan camera movement, subject movement, and framing that actually isolate the subject. Increasing the scroll distance cannot remove objects that are already visible in the footage.

Represent meaningful transition beats as additional rows in the same three-column table. A transition can use “No copy — let the motion lead” in the Website copy column when text would distract.

Add a concise **Scroll pacing** plan after the table. For every scene and transition, specify:

- Which elements enter and leave the viewport.
- The planned camera framing and composition.
- Approximate active scroll travel in viewport heights.
- Whether the interval contains normal motion, slower motion, or a held frame.

Give each beat a stable identifier. Record desktop and mobile scroll ranges, source frame ranges, copy visibility ranges, focal point/crop, and hold behavior in one timeline configuration. Derive rendering and HTML transitions from that configuration rather than scattering unrelated thresholds through components. Keep the customer-facing Visual Story table at exactly three columns; technical mapping belongs in the pacing plan or project files.

Choose scroll distances separately from video duration and extracted-frame count. A six-second video may occupy several viewport heights. More frames improve temporal sampling; they do not automatically extend the scrolling sequence. Describe pacing in viewport heights or equivalent layout measurements, not wheel turns, because input devices vary.

Treat initial distances as adjustable design decisions. For example, an extended reveal could allocate one viewport height to the introduction, one or two to isolated movement, and another to the reveal. Refine those values to suit the actual story and reading time.

Use a timeline with independently mapped segments whenever different beats require different emphasis. Give important motion or transitions more travel and add purposeful frame holds for text. Keep a **held image** distinct from **ongoing movement**: a freeze is useful for a pause, but continued action needs enough usable footage and intermediate frames. Spreading a few frames over a large scroll interval does not create smooth motion. Generate a longer clip or a separate transition when needed, using the continuity approach below.

Establish this timing plan before generating footage so the source includes the necessary entrance, isolated action, and exit. During implementation, map each scroll segment to its own frame range. For a hold, map the entire segment to one frame. Preserve continuity across segment boundaries in both scroll directions. Calculate active pinned travel separately from the visible stage height so layout measurements do not reduce the planned animation distance.

When browser interaction testing is allowed, check the experience with ordinary scrolling. Confirm that transitions have sufficient space, destinations appear at the intended moment, and copy remains readable long enough. Adjust frame ranges and scroll distances based on those observations. If interaction testing is unavailable, report that pacing has not been verified; a successful build alone is not evidence of smooth playback.

### Maintain continuity between scenes

For a narrative that follows one subject through several actions or settings, use connected sequences with matching handoff frames. The next scene should continue from the visible state of the previous scene. Keep the subject's identity, geometry, materials, scale, lighting, and spatial relationships consistent. Changes of setting should happen through an intentional transition rather than an accidental replacement at a clip boundary.

Select the least complex architecture that supports the story:

**A single continuous sequence:** Keep the visual stage pinned while scrubbing a short video sequence. Introduce, move, fade, or replace real HTML content at planned progress intervals. Several apparent hero sections can exist as chapters within that one stage.

**Several connected sequences:** Use separate matched clips when the action, setting, or composition exceeds what a single clip can reliably deliver. Extract the accepted final frame from one sequence and supply it as the starting frame or reference for the next, using controls supported by the model. Continue the current action and camera movement. Match subject position, orientation, framing, and background at the join. Do not generate disconnected scenes independently and expect a crossfade to establish continuity.

In guided or explicitly step-by-step work, wait for feedback on the table and connection plan before generating story footage or implementing the animation. In autonomous or template work, present the same plan and continue without waiting for aesthetic approval.

Combine identity and storyboard review into one checkpoint where practical. In autonomous mode, asset acceptance means your own inspection, not an extra request for user approval. Reopen settled creative decisions only when a concrete defect requires it.

Avoid imposing a fixed clip length or an indefinitely pinned hero on every website. A clip of roughly 6–12 seconds can be an initial choice if the model supports it. Produce the motion the narrative requires. Combine scrubbed sequences, transitions, resting images, and normal page sections as appropriate.

Plan narrow-screen composition at this stage. Leave room for copy and make sure the subject survives mobile cropping. Avoid placing critical actions at both outer edges. Create a separate mobile asset only when it offers a meaningful improvement.

Prove the pinned layout, poster, one short representative sequence, and one HTML chapter transition in the actual project before producing all dependent footage. Use an available accepted asset or a clearly identified local placeholder for this check. This is an implementation check, not an additional design approval or a substitute for the requested final media.

## 4. Produce, review, and prepare media with Higgsfield MCP

Inspect the live model schema before sending generation requests. Confirm supported durations, aspect ratios, resolutions, reference-image roles, and first/last-frame parameters. Respect the requested provider and the user's billing preferences. Permission to create media does not include permission to purchase a subscription or alter account settings.

Keep a compact production ledger linking each scene to its reference files, prompt, model/settings, job ID, status, accepted output, and reason for any correction. Record quoted or returned generation cost when available; do not invent estimates. Begin with one candidate per planned scene and at most one targeted corrective regeneration per failed scene, within any user-set budget. Reuse acceptable results. If that does not resolve the defect, simplify within the accepted story or report the specific dependency instead of repeatedly spending credits. Explicit user budgets and retry preferences override these defaults.

Generate key still images first when they help settle composition or maintain identity. Reuse accepted references for related clips. Define subject action, camera behavior, materials, lighting, space for HTML text, and the intended transition endpoints. Request uninterrupted shots unless the storyboard intentionally includes cuts. Keep navigation, headings, descriptions, and CTAs out of generated pixels.

Produce dependent scenes in sequence:

1. Review and accept the first scene.
2. Extract a clean ending frame at the chosen handoff.
3. Supply that exact raster file through the next model's supported starting-frame or reference input.
4. Generate the following scene as a continuation of that state.

Carry forward the same identity references and visual settings. Decide on and inspect the outgoing frame before starting its dependent generation. Independent still-image work and website implementation can proceed alongside this process.

If a model cannot accept a starting frame, use supported image-to-video or reference guidance, or choose a compatible model within the user's constraints. Explain the limitation instead of promising a guaranteed match.

Review the outgoing and incoming frames together at every seam. Check for changes in position, scale, orientation, lighting, camera direction, and motion that could produce a jump in either scroll direction. A reference frame improves guidance but does not ensure continuity. Fix visibly broken joins before integration. Use matching output dimensions and crop treatment throughout, and align HTML chapter changes with the accepted joins.

Record generation job IDs. Retrieve the result of an existing request before submitting a replacement; pending work is not a failure. Continue layout and content work while media renders. Present useful completed assets promptly and avoid extra approval pauses in autonomous mode.

Use available media tools to inspect representative frames and the complete motion. Evaluate continuity, unwanted text, composition, visual consistency, and the readability of planned HTML overlays. Make focused corrections when an essential requirement fails. Preserve good assets and avoid indefinite regeneration cycles.

Keep the original video files and selected brand masters. Use an available media utility such as FFmpeg to create a browser-ready image sequence. For example:

```bash
ffmpeg -i input.mp4 -an -vf "fps=18,scale=1280:-2" -c:v libwebp -quality 78 -start_number 0 frames/frame-%04d.webp
```

This command is an initial configuration, not a universal specification. Adjust sampling rate, output dimensions, and quality to the movement and measured transfer size. Do not enlarge a low-resolution original. Extract into a new staging directory rather than overwriting an existing sequence.

Create a manifest containing the actual frame count, image dimensions, filename pattern, and valid poster reference. Verify numbering, file sizes, referenced paths, and the first, middle, and final frames before connecting the sequence to the website. Display an appropriate still immediately while the animation assets load.

## 5. Implement the full website and animation

Work within the current project and reuse components that fit. Follow any required build and deployment process supplied by the hosting environment. Maintain a single owner for source management and publishing.

Build the business website around the animation: usable navigation, a clear explanation of the offering, relevant content sections, and a primary visitor action. Let the brief determine which sections are necessary rather than inserting every conventional landing-page block.

Implement the scroll narrative with a pinned canvas, an image stage, or another reliable equivalent. Map progress inside the active beat to that beat's frame range, not uniformly across the entire narrative:

```text
beatProgress = clamp((scrollPosition - beatScrollStart) / beatScrollDistance, 0, 1)
frameIndex = round(frameStart + beatProgress * (frameEnd - frameStart))
frameIndex = clamp(frameIndex, 0, frameCount - 1)

// A still-frame hold uses frameStart == frameEnd.
// A single full-sequence beat uses frameStart = 0 and frameEnd = frameCount - 1.
```

Use consistent scroll coordinates and positive beat distances; validate the configuration before rendering. Define shared boundary behavior so the correct scene and copy remain selected at exact boundaries and during reverse scrolling.

Render motion separately from semantic HTML. Navigation, buttons, headings, feature labels, and timed copy must stay selectable, sharp, accessible, and editable. Synchronize their appearance with the narrative plan. When a label is meant to follow a moving object, implement tracking or deliberate position keyframes; a static overlay will not follow the object by itself.

Preserve native scrolling in both directions. Avoid scroll hijacking, make scene boundaries deliberate, and allow ordinary content to flow naturally outside the animation. Ensure invisible overlays neither capture pointer input nor leave hidden links in the keyboard tab order.

Prioritize loading the currently requested frame and nearby frames. Limit simultaneous requests and decoded-image memory. Cancel or discard outdated work, release bitmaps when evicted, and avoid retaining the entire full-resolution sequence in memory. Retry missing frames only a bounded number of times.

Handle rapid scroll jumps, backward scrolling, resizing, high-density screens, and component teardown. Keep a meaningful still visible if media cannot load.

Make loading and drawing explicit:

- Put the poster and essential HTML in the initial page output. Do not lazy-load the above-the-fold hero image or wait for the full sequence to reveal the page. Reserve its layout dimensions and prioritize critical content over speculative frame downloads.
- Schedule drawing with requestAnimationFrame and avoid repeated draws when neither frame nor canvas size has changed. Do not drive a full component-tree render on every scroll event. Keep layout reads and writes out of repeated per-frame work where possible.
- Size the canvas backing store for the displayed size and a documented, bounded device-pixel ratio. Estimate decoded-frame memory from dimensions and pixel storage, not compressed WebP size. Record request concurrency, cache limits, initial transfer size, and total sequence size; adapt those limits to the target devices.
- Prevent late responses for obsolete frame requests from replacing the current frame. While the requested frame is unavailable, retain a useful decoded frame or poster. Handle invalid or empty manifests without blanking the page.
- Suspend unnecessary animation work when the stage is offscreen or the document is hidden. Release listeners, observers, pending work, and decoded resources when the component is removed.

### Mobile navigation and composition

Keep a compact mobile header fixed above the complete page, mounted outside the pinned story. Preserve a visible brand mark or wordmark and menu control after the animation ends. Use a contrasting branded background, safe-area padding, and touch targets of at least 44 × 44 CSS pixels as this project's design target.

Use a real button for the menu toggle with an accessible name and expanded state. Support keyboard operation, closing after link selection, Escape, and appropriate focus return. If the menu is modal, contain focus inside it and make the background inert while open. Keep fixed-header offsets on anchor destinations so headings remain visible.

Compose mobile copy, visual framing, and scroll distances independently within the same codebase. Keep the opening view concise while communicating the offer and making the primary action reachable without completing the story. Account for browser toolbar changes, orientation changes, and the on-screen keyboard. Avoid recalculating scroll ranges on every minor viewport-height fluctuation if that causes jumps. Check for horizontal overflow and sticky-position failures caused by ancestor styles.

Provide reduced-motion and constrained-device alternatives that retain the message and primary CTA. Include a way to skip a long animated sequence. Recompose the layout for mobile instead of simply scaling down the desktop view. Visitors must be able to understand the business without watching the animation.

When prefers-reduced-motion is enabled, use an intentional static or minimally animated presentation, remove unnecessary pinned travel, and expose the chapter content in a readable order. Do not fetch the full animation sequence for a static fallback. If animation code fails, preserve the poster, content, navigation, and primary action. Keep hidden visual chapters out of keyboard navigation without removing information from the accessible alternative. Maintain visible focus, labeled form controls, meaningful image alternatives, and readable contrast across every moving background.

Provide basic page metadata, a descriptive title, useful heading hierarchy, and social-preview metadata using confirmed assets. Set canonical URLs only when the real destination is known. Do not invent structured-data ratings or business details, or change a private draft's indexing or access settings merely to satisfy an SEO checklist.

## 6. Enable editing, verify the experience, and deliver

Store business copy, service information, CTAs, and media references in a clearly organized content file or suitable existing CMS. Keep the timeline and asset manifest equally easy to locate, with exact editing paths in the handoff. Build a browser editor only if requested or already required by the project; an editable content file satisfies the default requirement. If an editor stores changes only in local storage, explain that limitation and provide export/import along with the real process or destination for publishing edits. Do not represent a browser-local draft as a shared live update.

Connect forms to a real submission endpoint or explicitly identify them as demonstrations. Never display a successful-send message when no submission occurred.

Run the project's relevant code checks, production build, and asset validation. Check the sequence manifest, frame URLs, posters, and source files. Use the tools permitted by the environment to assess responsive layouts, motion fallbacks, and essential interactions. Report which checks were performed and which remain untested. Build success alone does not establish visual quality or smooth animation.

Use the following acceptance checks, adapting viewport sizes to the actual audience. Suggested samples are 1440 px desktop, 768 px tablet, and 390 px and 320 px mobile widths; also inspect a short landscape viewport. These are test samples, not mandatory CSS breakpoints.

| Area | Evidence required before marking it verified |
| --- | --- |
| First impression | The offer, brand, and main action are clear; the poster and layout appear without waiting for every frame. |
| Visual layout | Inspect the opening, each scene join, final reveal, and normal content below the story at representative widths; no clipped copy, hidden subject, or horizontal overflow. |
| Motion | Exercise slow scrolling, rapid jumps, reverse scrolling, resize, and page reload partway down; no blank stage, broken seam, or wrong chapter state. |
| Navigation and conversion | Follow every primary CTA and navigation destination; verify the mobile menu, anchors, and actual form/cart/booking behavior within scope. Distinguish demo behavior from a connected backend. |
| Accessibility and failure | Check keyboard navigation, focus visibility, reduced motion, and a failed frame request; the content and main action remain usable. |
| Production and assets | Build succeeds; required routes and referenced files resolve; no material runtime errors; original media and editable files are included. |
| Performance | Report measured initial transfer and sequence sizes, configured memory/loading limits, and available loading or interaction measurements with their test conditions. Never substitute a guessed score or lab result for real-user evidence. |

Mark each area passed, failed, or not tested, with concise evidence or a concrete reason. Fix observed failures with focused changes and rerun affected checks. Do not keep adding optional tests after the relevant requirements pass. Do not claim device, browser, accessibility, or performance verification that the available tools could not perform.

Publish only to the audience and scope the user has authorized. Use an authorized private preview when the environment provides one. Do not expose a draft publicly without authorization. If publishing cannot be completed, provide a runnable local project and identify the dependency preventing deployment.

Deliver the following as appropriate to the completed project:

- The functioning website or preview.
- The style tile and selected logo master files.
- The original video clip or clips.
- Editable content and concise instructions for making changes.
- A short production note covering the design direction, assumptions, generation prompts, asset provenance, relevant measurements, and observed limitations.

Keep credentials and temporary signed URLs out of reusable deliverables.

Continue until the requested website is finished or a specific unresolved dependency prevents further progress. Show meaningful progress and completed work instead of repeatedly restating plans. For a template request, finish a coherent template now and leave its content ready for later customization.

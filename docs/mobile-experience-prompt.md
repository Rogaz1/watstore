# Mobile Experience for a Cinematic Website
## Implementation prompt — version 2

Build and validate an intentionally composed mobile experience within the same website and codebase as desktop. Preserve the brand and story while adapting layout, media, and scroll progression to the available screen.

The goal is a compelling visual story with readable content, usable navigation, and a clear primary action. Visitors must be able to reach the main content immediately, regardless of animation availability.

### 1. Inspect first and set priorities

Inspect the existing site, framework, navigation, assets, animation system, and responsive rules before editing. Reuse working components and dependencies. Avoid unrelated redesigns or framework migrations.

Resolve these inputs from the project or conversation:
- Brand, exact product references, existing copy, primary action, and its real destination.
- Story beats, existing desktop and portrait assets, and generation/editing capabilities.
- Supported browsers, representative viewports, existing breakpoints, and any performance budget.

Ask only when a missing input materially blocks correct implementation. Otherwise make a reversible assumption, state it briefly, and proceed.

Treat accessibility, working links, brand fidelity, usable fallback content, and correct initial asset selection as requirements. Treat resolution, frame density, preload range, scroll length, and breakpoints as adjustable settings.

When requirements compete, prioritize navigation and primary-action access, readable content and product fidelity, then decorative motion. On short screens, allow content to flow below the visual rather than shrinking text or cropping the product.

Before producing the complete animation, build a working sample with the header, poster, primary action, one representative transition, and final reveal. Check composition and loading behavior, then continue without requiring a separate approval step.

### 2. Define responsive layout and framing

Use shared content and site structure with responsive layout and separate animation assets. Avoid duplicating the full website for mobile.

Use one documented media-selection rule across layout, posters, and frame loading. Reuse the project's breakpoint where appropriate; explicitly handle tablets and landscape phones. Select by viewport needs rather than device-name detection.

Define the visible animation region after accounting for the header, safe areas, and copy. For each major story beat, record the subject's focal point and bounding box in normalized coordinates. Check these against the intended crop at representative aspect ratios; “keep it centered” alone is insufficient.

Choose viewport-height behavior deliberately:
- Use a stable height strategy, such as small viewport units where appropriate, for scroll measurements that must not jump when browser toolbars retract.
- Use dynamic viewport sizing where fitting the currently visible screen matters, such as an open navigation overlay.
- Recalculate on meaningful layout and orientation changes without repeatedly resetting story progress during toolbar movement.
- Test virtual-keyboard behavior separately where forms or search are present.

Reserve media dimensions before loading. Accommodate safe-area insets once in each relevant layout calculation. Prevent horizontal overflow by fixing its cause rather than concealing clipped content.

### 3. Keep navigation persistent and accessible

Fix a compact branded header above the page throughout the story and all following sections. Keep the brand symbol and wordmark on the left and an accessible menu button on the right.

Mount the header outside pinned sections and ancestors that constrain fixed positioning. Use a deliberate stacking order, a contrasting background, and touch targets at least 44 × 44 CSS pixels.

Implement navigation with semantic links and buttons, an accessible button name, expanded state, visible focus, and a close control. Ordinary navigation links should not receive application-style ARIA menu roles.

Choose the correct interaction pattern:
- A disclosure panel retains normal document focus behavior.
- A modal overlay moves focus inside, contains keyboard focus, makes background content inactive, and locks background scrolling without losing the page position.

Support keyboard operation and Escape to close. Close after link selection. Restore focus to the trigger on dismissal; for same-page navigation, place focus appropriately at the destination.

Offset anchors using the header's actual occupied height, including any safe-area padding already applied. Do not count that padding twice.

### 4. Compose the hero and final reveal

Show the persistent header, one short headline, one primary action, and a subtle scroll cue in the opening composition. Keep a separate “Skip animation” link discoverable while the story is active.

Use supplied or existing brand language. Do not invent product claims, offers, testimonials, or destinations.

Place text in planned negative space. Keep essential text as HTML, with readable contrast and usable text enlargement. Avoid embedding headlines or buttons inside animation frames.

Remove decorative labels and secondary copy when they compete with the visual. During the main story, minimize overlays while retaining access to navigation and skipping.

At the final reveal, show the complete product with legible branding, concise copy, and the primary action. On screens that can accommodate it, position the product above the copy; otherwise use normal vertical flow.

Provide the same essential information and action outside the animated presentation. The story must never be the only route to understanding or buying the product.

### 5. Create coherent portrait media

For an image-sequence experience, provide a dedicated portrait animation alongside the landscape sequence. Start near 9:16 and compose for the actual mobile crop; do not stretch landscape footage.

Reuse suitable existing portrait assets. Generate replacements only when needed and supported by the available tools. If generation is unavailable, implement an honest still-image fallback and identify the missing media.

Preserve product geometry, proportions, packaging, logo, label, palette, lighting, and materials. Use supplied product and logo assets where exact identity matters. Inspect generated branding; use faithful compositing where feasible instead of accepting distorted labels.

Before full generation, map each story beat: intended motion, camera behavior, subject position, text-safe area, and transition reference.

- Use the preceding clip's actual final frame as the next clip's starting reference.
- Inspect joins for spatial continuity AND motion continuity: direction, speed, and acceleration. Matching still frames alone does not guarantee a seamless transition.
- Keep the environment continuous to every edge, without seams, panels, or mismatched backgrounds.
- Verify requested motion in the actual output. A renderer pan, scale, or in-plane rotation may supplement footage when visually appropriate; it cannot substitute for a missing three-dimensional camera orbit.
- Maintain full frame coverage during rotations and zooms. Preserve intended macro detail rather than substituting blur.
- Test the final product crop before rendering the full sequence.

### 6. Make scroll progression explicit

Tune mobile independently from desktop while preserving the same narrative.

Create a small configuration table for story beats. For each beat, define its frame range, share of total scroll progress, brief hold if needed, and visible copy. Set a documented total scroll distance and tune it on the test viewports.

Use ordinary page scrolling. Do not intercept touch or wheel input to force gestures, disable pinch zoom, or require a fixed number of swipes.

Compress inactive intervals between landing and transformation. Preserve smooth progression through movement and reveal. Adjust scroll distance and mapping before reducing frame density.

Treat source sampling rate and browser rendering cadence as different settings. Approximately 18 sampled source frames per second may be a starting point for some footage, but is not a browser render-rate cap or a guarantee of smooth scrubbing. Check slow forward and reverse scrolling, fast flings, and direction changes.

Keep opening and closing holds brief but sufficient for reading. When the requested frame is missing, retain a valid nearby frame or poster and prioritize the newly requested frame. Do not force the visitor to wait through obsolete requests.

“Skip animation” must reach and focus the main content immediately, stop unnecessary story prefetching, and work before media finishes loading. Resume loading only if the visitor returns to the story.

Handle direct anchor links, refresh partway down the page, and browser Back/Forward restoration without forcing a return to the opening.

### 7. Control loading, memory, and lifecycle

Render usable HTML content and a responsive poster first. Keep the page usable with JavaScript disabled or animation initialization unsuccessful.

Select the active variant and check reduced-motion preferences before scheduling sequence requests, including preloads. On a fresh load, request only the selected portrait or landscape sequence. Do not download both and hide one with CSS.

Keep configuration for dimensions, frame count, sampling rate, request concurrency, prefetch range, cache budget, and canvas pixel density in one place. Document chosen values and adjust them using the working sample.

- Prioritize the visible poster and current frame; fetch nearby frames according to direction and available capacity.
- Bound network concurrency and decoded-frame memory separately. Do not retain every downloaded frame in decoded form.
- Estimate decoded memory from pixel dimensions as well as transfer size. A 720 × 1280 frame at four bytes per pixel is about 3.52 MiB; 30 such frames are about 105.5 MiB before other overhead. Label this an estimate, not measured browser memory.
- Evict distant frames and release resources supported by the renderer, including closing ImageBitmaps where used and revoking obsolete object URLs. Limit backing-store resolution to what improves visible quality.
- Render on demand using the browser's animation scheduling. Avoid continuous redraws when the frame and layout are unchanged.
- Stop unnecessary rendering and prefetching when the story is offscreen or the tab is hidden. Clean up listeners, requests, timers, and graphics resources on teardown.

When the viewport changes asset variants, cancel cancellable requests and reject stale asynchronous results. Preserve the corresponding story beat and progress within it, especially when the variants have different frame counts. Release obsolete resources after a safe visual handoff.

Already transferred bytes cannot be undone. The requirement is to prevent unnecessary new requests and stale rendering, not to claim that cancellation removes previous downloads.

When reduced motion is enabled, use a composed still and normal flow without fetching the animation sequence or creating a long pinned spacer. Respond if the preference changes during the visit.

Use bounded retries for failures. If playback cannot recover, retain the poster and actions, remove animation-only scroll space without stranding the visitor, and keep the main content accessible.

### 8. Verify behavior with evidence

Use the existing project's validation tools. At minimum, inspect narrow, typical, tall, and short phone layouts. Suggested CSS viewport samples are 320 × 568, 360 × 800, 390 × 844, 430 × 932, and a landscape phone view. Also check a tablet and desktop. Adapt this set to the target audience.

Test mobile Safari and Android Chrome where available. Distinguish browser emulation from checks on physical devices.

Validate:
- Readability, text enlargement, safe areas, and no horizontal overflow.
- Subject containment, continuous backgrounds, clip joins, and final product branding.
- Slow, fast, reverse, and interrupted scrolling; no exposed edges or blank flashes.
- Persistent navigation beyond the story; correct focus, Escape behavior, and anchors.
- Real primary-action destinations and immediate story skipping.
- Toolbar changes, orientation changes, breakpoint transitions, and history restoration.
- Reduced motion on first load and during a visit.
- A failed frame request, failed sequence initialization, and JavaScript-disabled fallback.
- Responsive behavior of the rest of the page after mobile changes.

Inspect cold-load network requests to confirm that only the selected sequence is requested and reduced-motion mode makes no sequence requests. Check that skipping and variant changes stop unnecessary scheduling.

Report poster size, initial animation transfer, complete sequence size, and decoded-cache estimate separately. For timing measurements, record browser, device or emulation, viewport, cache state, network throttling, and CPU settings.

Use Core Web Vitals as reference targets: LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1. These are field targets evaluated at the 75th percentile; a single local test does not establish a field pass. Report only metrics actually measured and separate lab results from field data.

Fix observed failures before finishing. If a requirement cannot be verified with available tools, mark it “not tested” and state what remains.

### 9. Deliver the finished implementation

Provide a working preview, representative opening and final-reveal screenshots where capture is available, and a concise implementation report containing:
- Changes made and assumptions used.
- Asset-selection rule and adjustable configuration values.
- Validation results marked passed, failed, or not tested.
- Measured performance results and remaining limitations.

Explain that mobile and desktop are responsive versions of the same website and automatically use the appropriate animation assets. Do not claim that previews, media, tests, or measurements exist unless they were actually produced.

# Research demonstrations — 25 October 2026

Three 60-second H.264 MP4 recordings, 30 fps, without audio. The updated AEM and
PEMFC recordings are 1920 × 1080; the existing UAV recording remains 1600 × 900.
The website uses native video controls and does not autoplay or preload video data.
Posters are frames from the corresponding edited videos.

## Contents

- **hydrogrid-aem-detail-v2.mp4** — Renewable supply, AEM stack, balance-of-plant pumps and heat exchanger, and separate hydrogen/oxygen storage. Close-ups and process telemetry are crops from the same recorded frame, with concise English captions.
- **pemfc-autonomous-lab-detail-v2.mp4** — Robot-operated load knob, electrical response, and unloaded valve closure followed by gripper release. Separate local sessions are combined. Synchronized close-ups show the robot, current, voltage and valve status. Recording-speed changes are marked on screen.
- **hybrid-uav.mp4** — A registered climb task with native Simulink fuel-cell/battery power and Unity flight telemetry. The edit includes a brief reprise of the recorded flight, not an extended flight-duration claim.

## Evidence boundaries

These are recordings of running research software, not physical prototypes, flight tests or hardware-in-the-loop certification. No measurements, motion or curves were fabricated for the videos.

- HYDROGRID uses an uncalibrated averaged model and a reference 3D layout. The overview session completed; detail views came from a separate operator-stopped session.
- PEMFC robot, valve, thermal and sensor models require hardware calibration. The knob sequence was stopped after demonstration; no complete autonomous-optimisation result is claimed.
- The UAV run passed its trace-coupling and registered-task checks but failed its full-run protection check because of a startup oxygen-excess-ratio excursion. The video does not demonstrate flight safety, endurance or energy savings. A failed supplemental capture was excluded.

Raw recordings, native run outputs, recording receipts, source hashes and frame-accurate edit plans are retained locally by the author. Reviewed MP4s, poster frames, English WebVTT captions and this description are published; private local paths and runtime logs are not included. Previous video versions are retained.

## Adding future project videos

The Research Projects section has no fixed project count. It uses one column on
small screens and two columns from 768 px, creating additional rows automatically.
There are no empty video placeholders. Playback starts only after user interaction;
starting another video pauses the previous one.

1. Add an H.264 MP4 and its poster image to `assets/media/demos/`, with a unique
   versioned filename. Add an English `.vtt` file if available.
2. Append an entry to `SITE.projectVideos` in `assets/js/content.js`, following an
   existing entry. Set the title, category, duration, description and recording scope.
   `chapters`, `captions` and `transcript` are optional.
3. Use `published: false` while an entry is being prepared. Draft entries and entries
   without a title, video path or poster path are not rendered. Do not publish until
   the referenced files exist and playback has been checked.
4. Use chapter times in seconds within the video duration. Keep on-screen captions,
   WebVTT captions and transcript consistent. Describe only demonstrated operations.
5. Check mobile/desktop layout, chapter seeking and MP4 playback; then update the
   asset cache version in `index.html` when publishing changed JavaScript or CSS.

The current UAV clip demonstrates the recorded climb task. It does not claim a
complete takeoff-to-landing mission; such a replacement requires a separate
verified run before publication.

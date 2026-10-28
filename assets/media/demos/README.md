# Research demonstrations — credits updated 28 October 2026

Three H.264 MP4 recordings, 30 fps, without audio. The AEM and robotic-lab
videos are 60 seconds; the complete UAV mission is not limited to 60 seconds.
The current exports are 1920 × 1080. The cinematic UAV source is a native
1920 × 1080 Unity client capture; it is not upscaled from the earlier video.
The website uses native video controls and does not autoplay or preload video data.
Posters are frames from the corresponding edited videos.

## Contents

- **hydrogrid-aem-professional-v7.mp4** — Renewable supply, AEM stack, balance-of-plant pumps and heat exchanger, and separate hydrogen/oxygen storage. Close-ups and process telemetry are crops from the same recorded frame, with concise English captions.
- **pemfc-autonomous-lab-professional-v8.mp4** — Robot-operated load knob, electrical response, and unloaded valve closure followed by gripper release. Separate local sessions are combined. Synchronized close-ups show the robot, current, voltage and valve status. Accelerated sections have compact 2x/3x indicators.
- **hybrid-uav-cinematic-v8.mp4** — A continuous recorded mission covering takeoff, accelerating climb, cruise, lateral avoidance of a known static obstacle, descent and touchdown. Close-up camera views retain an accompanying complete ground-path trace and altitude history. Same-run native logs provide fuel-cell and battery power, delivered propulsion shaft power, DC-bus voltage, SOC and stack temperature histories.

The 28 October exports update only the author-name region to **Dr. Zhihua Deng,
Dr. Bin Miao, Prof. Siew Hwa Chan**. The existing Fuel Cell Lab / Nanyang
Technological University line remains. All videos retain their resolution,
frame count, duration, captions, data displays and speed indicators. The original
versions are preserved. Full decoding and sampled comparisons outside the edited
header were checked; re-encoding introduces minor compression differences.

The preceding 25 October edits removed the editorial footer sentences about recording
speed, session names and synchronized crops. The UAV recording/log footer is
also removed. Only these footer regions were covered; imagery, data curves,
phase captions, attribution and timing remain unchanged apart from video
re-encoding. Original files are retained. The mechanical-arm sequence retains
2x indicators at 8–20 s and 50–60 s, and a 3x indicator at 35–50 s; all other
segments keep their previous timing. These factors describe playback relative
to the source recording, not simulation real-time performance.

Each current export includes persistent attribution in a separate header:
**Dr. Zhihua Deng | Prof. Siew Hwa Chan**, **Fuel Cell Lab | Nanyang Technological University**.
The UAV edit preserves continuous captured wall time, trimming initialization
and terminal idle. The 15 fps capture is encoded at 30 fps by duplicating frames,
not synthesizing intermediate motion. Per-frame native-tick metadata selects
the corresponding log records. The original flight viewport is unchanged;
data plots are composed into reserved panels. Editorial captions are
revised for technical accuracy, with matching English WebVTT files for all three
videos. Current demand is distinguished from simulated current; robot-operated
valve-handle rotation is not described as a human operation. Earlier exports remain available.

## Evidence boundaries

These are recordings of running research software, not physical prototypes, flight tests or hardware-in-the-loop certification. No measurements, motion or curves were fabricated for the videos.

- HYDROGRID uses an uncalibrated averaged model and a reference 3D layout. The overview session completed; detail views came from a separate operator-stopped session.
- PEMFC robot, valve, thermal and sensor models require hardware calibration. The knob sequence was stopped after demonstration; no complete autonomous-optimisation result is claimed.
- The current UAV mission passed 18 software-demonstration checks, including takeoff, avoidance, descent and ground-contact/disarm. Its position, velocity and propulsion-power fields match an earlier independently recorded run at all 36,000 fixed integration intervals. Earlier failed development runs are retained separately; this is not flight-safety certification, calibrated aircraft validation, endurance or energy-savings evidence.

The propulsion shaft trace is independently recomputed from native load torque
times angular speed, matching the nonnegative power available to Unity flight
dynamics. It is not conflated with the model's distinct internal mechanical
power signal. Other plot transformations are W to kW and K to degrees Celsius;
SOC is already logged in percent. Time-history drawing retains first/minimum/
maximum/last observations in chronological order within each pixel column and
reveals only past data. No smoothing is applied. Model time is labelled because
offline simulation speed differs from the captured wall clock.

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
   `captions` is optional. Recording notes, chapters and transcripts may be retained
   as source metadata; video cards do not display supplementary links or disclosures.
3. Use `published: false` while an entry is being prepared. Draft entries and entries
   without a title, video path or poster path are not rendered. Do not publish until
   the referenced files exist and playback has been checked.
4. Keep on-screen captions and WebVTT captions consistent. Describe only
   demonstrated operations in the project description.
5. Check mobile/desktop layout, native video controls and MP4 playback; then update the
   asset cache version in `index.html` when publishing changed JavaScript or CSS.

Older video versions remain available as historical artifacts. The current
website points only to the latest reviewed exports listed above.

## Related research pages

`SITE.researchLinks` adds external research cards to the same responsive grid.
These are explicitly labelled external websites, with no placeholder players.
The AIone Lab team-page link is also shown in the About section. Its public
team listing was checked on 28 October 2026 and lists Dr Deng Zhihua as an
AI Engineer. No reciprocal link or institutional endorsement is implied.

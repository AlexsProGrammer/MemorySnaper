
### Stuff need to Fix:


make the missing file donwlaod section load faster, currently it takes quite long so the list will load



overlay img forimg/vid not working? compare with old version and demo data



when i restart the app, and a session will automaticly start in run state



mark files where overlay failed in db
general seems that all videos are missing the overlay. here analyze the codebase and the files. why this happens?



data reset failed after running the extractor
	not fully resset, logs, status. also seems that depsite stopped a mp4 was still running in bg, which maybe failed the reset data through settings. here also fully shutdown the downloader/extractor scripts




update logs. use timestamp for date, eg [10:19:40]. than state if its a improted img or video and also maybe its timestamp and translated location.

[2019-05-16] Extracting mid 0c999aa2 from ZIP archives (3301/5086)

[2019-04-18] Extracting mid ed53d0d8 from ZIP archives (3302/5086)






add spacing between side bar menu items + confirm window settings reset data





Analysis:"""
You now have enough evidence in your logs to pinpoint the issue precisely.

What is happening
1. ZIP lookup is working.
- The run finds and uses the correct archive and mid.
- So this is not a ZIP parsing or missing-file problem.

2. Overlay discovery is working.
- For memory item 7, overlay_present=true and the overlay command is attempted.
- So this is not a “overlay file missing” problem.

3. The failure is only in the video+overlay ffmpeg composition step.
- The overlay ffmpeg command starts for item 7.
- It then times out.
- Immediately after that, the fallback path (video without overlay) succeeds.
- Final status is success with overlay_requested=true, overlay_applied=false, overlay_fallback=true.

That means the pipeline is healthy overall, but the specific ffmpeg filter/transcode path for this mp4+png pair is not finishing in time.

Why this specific pair is problematic
From your earlier probe/log details, this video has rotation metadata and the overlay is large RGBA. This combination can make the filter graph much heavier or behave poorly on some ffmpeg builds:
1. Base video stream is stored as 960x540 with rotation side-data (-90).
2. Overlay PNG is high-resolution RGBA (portrait asset).
3. The command does scale+alpha-overlay+re-encode+aac in one graph.
4. With warning-only logs, ffmpeg gives almost no progress output, so it looks frozen.

So this is not simply “mp4 format bad” or “png format bad”.
- mp4 alone works (your fallback transcode succeeds).
- png overlay works on images (item 6 succeeds).
- The problematic case is this specific video overlay graph on real data.

Why earlier builds seemed fine
Most likely:
1. Your earlier test set didn’t include this exact problematic combination.
2. Image overlays still worked, so it looked generally correct.
3. The system previously hid fallback as success, so missing overlays were not obvious.

Now with the new telemetry, you can clearly see overlay fallback events, which is why the issue is visible now.

If you want, next I can implement the targeted composition fix for rotated videos (force deterministic orientation path before overlay and hard-bound overlay timeline to source duration), which is the correct technical step for this exact failure mode.
"""
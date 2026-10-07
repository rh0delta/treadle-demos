import json, subprocess, sys
MAC="/mnt/user-data/uploads/Screen_Recording_2026-10-06_at_4_02_02_PM.mov"
IPAD="/root/.claude/uploads/c425b404-9070-56b1-bb30-b10e57ebb1d0/a5c64a65-ScreenRecording_10-06-2026_16-02-35_1.MP4"
OFF=5.25   # iPad time = Mac time + OFF
# (mac_start, mac_end, rate)
SEG=[(5.0,6.6,1),(6.6,11.6,4),(11.6,14.0,1),(14.0,17.8,2),(17.8,21.0,1),(21.0,28.0,4.5),
     (28.0,31.0,1),(31.0,34.6,3),(34.6,38.0,1)]
# events in mac time
EV={"select1":5.8,"copy1":12.3,"click1":15.8,"paste1":19.05,"select2":27.5,"copy2":29.6,"click2":32.9,"paste2":36.45}
FPS=30
out=0; starts=[]
for s,e,r in SEG:
    starts.append(out); out+=(e-s)/r
total=out
def to_out(m):
    for (s,e,r),o in zip(SEG,starts):
        if s<=m<=e: return o+(m-s)/r
json.dump({"total":total,"events":{k:to_out(v) for k,v in EV.items()},"segs":[(s,e,r,o) for (s,e,r),o in zip(SEG,starts)]},open("events.json","w"),indent=1)
print(json.dumps({k:round(to_out(v),2) for k,v in EV.items()}), "total",round(total,2))
import os, shutil
def build(src,off,name):
    tmp="seg_"+name.split('.')[0]; shutil.rmtree(tmp,ignore_errors=True); os.makedirs(tmp)
    files=[]; tot=0
    for i,(s_,e,r) in enumerate(SEG):
        f=f"{tmp}/s{i}.mkv"; files.append(f)
        n=round((e-s_)/r*FPS); tot+=n
        subprocess.run(["ffmpeg","-v","error","-y","-ss",str(s_+off),"-t",str(e-s_+0.2),"-i",src,"-an",
            "-vf",f"setpts=(PTS-STARTPTS)/{r},fps={FPS}","-frames:v",str(n),"-c:v","libx264","-preset","ultrafast","-crf","10","-pix_fmt","yuv420p",f],check=True)
    open(f"{tmp}/list.txt","w").write("".join(f"file '{os.path.abspath(f)}'\n" for f in files))
    subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i",f"{tmp}/list.txt","-an","-c:v","libvpx-vp9","-b:v","0","-crf","26","-deadline","good","-cpu-used","6","-row-mt","1","-threads","8","-pix_fmt","yuv420p","-vf","tpad=stop_mode=clone:stop_duration=2.4",f"public/{name}"],check=True)
    print(name,"expected frames",tot,flush=True)
import sys
which=sys.argv[1]
if which=="mac": build("cfr/mac.mkv",0,"mac.webm")
else: build("cfr/ipad.mkv",OFF,"ipad.webm")

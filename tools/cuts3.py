import subprocess, os, shutil, sys
FPS=30
def build(src,segs,name,hold=3.2):
    tmp="seg3_"+name.split('.')[0]; shutil.rmtree(tmp,ignore_errors=True); os.makedirs(tmp)
    files=[]
    for i,(s_,e,r) in enumerate(segs):
        f=f"{tmp}/s{i}.mkv"; files.append(f); n=round((e-s_)/r*FPS)
        subprocess.run(["ffmpeg","-v","error","-y","-ss",str(s_),"-t",str(e-s_+0.2),"-i",src,"-an",
            "-vf",f"setpts=(PTS-STARTPTS)/{r},fps={FPS}","-frames:v",str(n),"-c:v","libx264","-preset","ultrafast","-crf","10","-pix_fmt","yuv420p",f],check=True)
    open(f"{tmp}/list.txt","w").write("".join(f"file '{os.path.abspath(f)}'\n" for f in files))
    subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i",f"{tmp}/list.txt","-an","-c:v","libvpx-vp9","-b:v","0","-crf","26","-deadline","good","-cpu-used","6","-row-mt","1","-threads","8","-pix_fmt","yuv420p","-vf",f"tpad=stop_mode=clone:stop_duration={hold}",f"public/{name}"],check=True)
# take A (pairing): Mac and iPad share the same extended timeline (iPad = Mac - 30.6, pre-padded)
A=[(1.3,5.3,1),(24.0,26.5,1),(30.6,33.0,1.5),(33.0,40.0,3.5),(40.0,47.0,1)]
# take B (gesture): cfr files start at source t=40; Mac = iPad + 5.4
which=sys.argv[1]
if which=="mac_a": build("cfr/mac_a.mkv",A,"mac_a.webm")
if which=="ipad_a": build("cfr/ipad_a.mkv",A,"ipad_a.webm")
if which=="mac_b": build("cfr/mac_b.mkv",[(17.8,25.9,1)],"mac_b.webm")
if which=="ipad_b": build("cfr/ipad_b.mkv",[(12.4,20.5,1)],"ipad_b.webm")
# take C (hold): Mac = iPad + 0.94
if which=="mac_c": build("cfr/mac_c.mkv",[(3.4,11.8,1)],"mac_c.webm")
if which=="ipad_c": build("cfr/ipad_c.mkv",[(2.46,10.86,1)],"ipad_c.webm")

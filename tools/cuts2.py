import subprocess, os, shutil, sys
OFF=-7.8   # iPad time = Mac time + OFF
SEG=[(12.4,14.4,2),(14.4,18.9,1)]
FPS=30
def build(src,off,name):
    tmp="seg2_"+name.split('.')[0]; shutil.rmtree(tmp,ignore_errors=True); os.makedirs(tmp)
    files=[]
    for i,(s_,e,r) in enumerate(SEG):
        f=f"{tmp}/s{i}.mkv"; files.append(f); n=round((e-s_)/r*FPS)
        subprocess.run(["ffmpeg","-v","error","-y","-ss",str(s_+off),"-t",str(e-s_+0.2),"-i",src,"-an",
            "-vf",f"setpts=(PTS-STARTPTS)/{r},fps={FPS}","-frames:v",str(n),"-c:v","libx264","-preset","ultrafast","-crf","10","-pix_fmt","yuv420p",f],check=True)
    open(f"{tmp}/list.txt","w").write("".join(f"file '{os.path.abspath(f)}'\n" for f in files))
    subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i",f"{tmp}/list.txt","-an","-c:v","libvpx-vp9","-b:v","0","-crf","26","-deadline","good","-cpu-used","6","-row-mt","1","-threads","8","-pix_fmt","yuv420p","-vf","tpad=stop_mode=clone:stop_duration=3.2",f"public/{name}"],check=True)
if sys.argv[1]=="mac": build("cfr/mac2.mkv",0,"mac2.webm")
else: build("cfr/ipad2.mkv",OFF,"ipad2.webm")

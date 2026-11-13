import json,os,subprocess,sys
wav,outp=sys.argv[1],sys.argv[2]
r=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',wav,'-af','loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
j=json.loads(r[r.rindex('{'):r.rindex('}')+1])
af=f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,alimiter=limit=0.89"
subprocess.run(['ffmpeg','-v','error','-y','-i',sys.argv[3] if len(sys.argv) > 3 else 'out/raw.mp4','-i',wav,'-map','0:v','-map','1:a','-c:v','libx264','-crf',os.environ.get('CRF','24'),'-af',af,'-ar','48000','-c:a','aac','-b:a','192k','-shortest',outp],check=True)

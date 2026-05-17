import os, glob

d = 'app/(tabs)'
for f in glob.glob(d + '/*.tsx'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    content = content.replace('router.replace("/nourish")', 'router.navigate("/nourish")')
    content = content.replace('router.replace("/profile")', 'router.navigate("/profile")')
    content = content.replace('router.replace("/wellness")', 'router.navigate("/wellness")')
    content = content.replace('router.replace("/bloop")', 'router.navigate("/bloop")')
    content = content.replace('router.replace("/insights")', 'router.navigate("/insights")')
    content = content.replace('router.replace("/dashboard")', 'router.navigate("/dashboard")')
    content = content.replace('router.replace("/cycle")', 'router.navigate("/cycle")')
    content = content.replace('router.replace("/pregnancy")', 'router.navigate("/pregnancy")')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Done")

import os, glob

templates_dir = "src/components/templates"
BAD_STYLE = 'style={{ fontFamily: "var(--font-body-custom, var(--font-inter))" }}'
BORDER_OLD = "border: '1px solid #C9A876', color: '#C9A876',"
BORDER_NEW = "fontFamily: 'var(--font-body-custom, var(--font-inter)), sans-serif', border: '1px solid #C9A876', color: '#C9A876',"

for path in glob.glob(f"{templates_dir}/*.tsx"):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if BAD_STYLE in content:
        # 1. Remove the orphan inline style prop
        modified = content.replace(BAD_STYLE, "")
        # 2. Add fontFamily to the real style block (only first occurrence = portada button)
        modified = modified.replace(BORDER_OLD, BORDER_NEW, 1)
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(modified)
        print(f"Fixed: {os.path.basename(path)}")
    else:
        print(f"Skip: {os.path.basename(path)}")

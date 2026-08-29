import os
import subprocess
import shutil

print("Building TRINETHRA PySide6 Standalone Executable...")

base_dir = os.path.dirname(__file__)
main_py = os.path.join(base_dir, "main.py")
assets_dir = os.path.join(base_dir, "assets")

cmd = [
    "pyinstaller",
    "--noconfirm",
    "--onedir",
    "--windowed",
    "--name", "Trinethra",
    f"--icon={os.path.join(assets_dir, 'app_icon.ico')}",
    f"--add-data={assets_dir};assets",
    main_py
]

print("Running command:", " ".join(cmd))
subprocess.run(cmd, check=True)
print("Build complete! Executable is available in dist/Trinethra/Trinethra.exe")

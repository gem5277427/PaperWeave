"""Build the Windows desktop release: a single PaperWeave.exe plus a zip."""

from __future__ import annotations

import shutil
import subprocess
import sys
import zipfile
from importlib.metadata import version
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
BUILD = ROOT / "build"
LAUNCHER = ROOT / "packaging" / "launcher.py"
ICON = ROOT / "src" / "paperweave" / "web" / "assets" / "paperweave.ico"
# 便携包中与 exe 同级的合规材料
EXTRAS = ["LICENSE", "LICENSES", "THIRD_PARTY_NOTICES.md", "data/README.md"]


def build_exe() -> Path:
    exe = DIST / "_exe" / "PaperWeave.exe"
    subprocess.run(
        [
            sys.executable,
            "-m",
            "PyInstaller",
            "--noconfirm",
            "--clean",
            "--onefile",
            "--windowed",
            "--name",
            "PaperWeave",
            "--icon",
            str(ICON),
            "--paths",
            str(ROOT / "src"),
            "--collect-data",
            "paperweave",
            "--distpath",
            str(DIST / "_exe"),
            "--workpath",
            str(BUILD),
            "--specpath",
            str(BUILD),
            str(LAUNCHER),
        ],
        check=True,
    )
    return exe


def stage(exe: Path) -> Path:
    release = DIST / f"PaperWeave-{version('paperweave')}-win64"
    if release.exists():
        shutil.rmtree(release)
    release.mkdir(parents=True)
    shutil.copy2(exe, release / exe.name)
    for name in EXTRAS:
        source = ROOT / name
        target = release / name
        if source.is_dir():
            shutil.copytree(source, target)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
    return release


def make_zip(release: Path) -> Path:
    archive = release.parent / f"{release.name}.zip"
    if archive.exists():
        archive.unlink()
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(release.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(release))
    return archive


def main() -> int:
    build_exe()
    release = stage(DIST / "_exe" / "PaperWeave.exe")
    archive = make_zip(release)
    print(f"[paperweave] exe:   {release / 'PaperWeave.exe'}")
    print(f"[paperweave] zip:   {archive}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

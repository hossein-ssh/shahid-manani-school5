#!/usr/bin/env python3
import os
import shutil
import sys
import zipfile

def create_archive():
    root_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    zip_name = "AndishehSari_Complete_Project.zip"
    zip_path = os.path.join(root_dir, zip_name)

    exclude_dirs = {"node_modules", "dist", ".git", ".turbo", ".next", ".cache", "__pycache__"}
    exclude_extensions = {".zip", ".pyc"}

    print(f"Creating ZIP archive from: {root_dir}")
    print(f"Target archive: {zip_path}")

    files_added = 0
    total_uncompressed_bytes = 0

    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for foldername, subfolders, filenames in os.walk(root_dir):
            # Prune excluded directories
            subfolders[:] = [d for d in subfolders if d not in exclude_dirs and not d.startswith('.git')]

            for filename in filenames:
                if filename == zip_name or any(filename.endswith(ext) for ext in exclude_extensions):
                    continue

                full_path = os.path.join(foldername, filename)
                rel_path = os.path.relpath(full_path, root_dir)

                # Skip any paths that might contain excluded dirs
                path_parts = rel_path.split(os.sep)
                if any(part in exclude_dirs for part in path_parts):
                    continue

                stat = os.stat(full_path)
                total_uncompressed_bytes += stat.st_size
                zipf.write(full_path, rel_path)
                files_added += 1

    zip_size_bytes = os.path.getsize(zip_path)
    zip_size_mb = zip_size_bytes / (1024 * 1024)

    print(f"Successfully packaged {files_added} files into {zip_name} ({zip_size_mb:.2f} MB)")

    # Copy to public folder for direct browser download
    public_dir = os.path.join(root_dir, "public")
    os.makedirs(public_dir, exist_ok=True)
    public_target = os.path.join(public_dir, zip_name)
    shutil.copy2(zip_path, public_target)
    print(f"Copied to public folder: {public_target}")

    # Copy to AI Studio artifacts directory
    artifact_dir = "/.aistudio/artifacts/brain/5b10eeae-8a3f-4b38-9eb4-686ea8d0e5f1"
    os.makedirs(artifact_dir, exist_ok=True)
    artifact_target = os.path.join(artifact_dir, zip_name)
    shutil.copy2(zip_path, artifact_target)
    print(f"Copied to artifacts directory: {artifact_target}")

    # Verify integrity
    with zipfile.ZipFile(zip_path, 'r') as zipf:
        test_result = zipf.testzip()
        if test_result is None:
            print("Archive integrity check: PASSED (No corrupted files)")
        else:
            print(f"Archive integrity check: FAILED on {test_result}")
            sys.exit(1)

if __name__ == "__main__":
    create_archive()

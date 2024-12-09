import argparse
import generate
import os
import shutil

parser = argparse.ArgumentParser()
parser.add_argument("target", help="target output of the extension", type=str, choices=["chrome", "firefox"])
parser.add_argument(
    "-c", "--cached",
    help="use a cached table of content instead of requesting the recent one",
    action="store_true"
)
parser.add_argument("-i", "--in_dir", help="the directory of the src files", type=str, default="")
parser.add_argument("-o", "--out_dir", help="the directory to store intermediate files in", type=str, default="out")
parser.add_argument("-d", "--dist_dir", help="the directory to store the extension in", type=str, default="dist")

args = parser.parse_args()

extension_path = os.path.join(args.out_dir, "extension")
if os.path.exists(extension_path):
    shutil.rmtree(extension_path)
os.makedirs(os.path.join(args.out_dir, "extension"), exist_ok=True)

generate.create_popup(args.out_dir, args.cached)

shutil.copytree(os.path.join(args.in_dir, "common"), extension_path, dirs_exist_ok=True)

if args.target == "firefox":
    shutil.copytree(os.path.join(args.in_dir, "firefox"), extension_path, dirs_exist_ok=True)
elif args.target == "chrome":
    shutil.copytree(os.path.join(args.in_dir, "chrome"), extension_path, dirs_exist_ok=True)


os.makedirs(args.dist_dir, exist_ok=True)
dist_filepath = os.path.join(args.dist_dir, f"spoilerfree_twi_wiki-{args.target}")
if os.path.exists(dist_filepath):
    os.remove(dist_filepath)

shutil.make_archive(
    dist_filepath,
    "zip",
    root_dir=extension_path,
    base_dir="."
)

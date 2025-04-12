from bs4 import BeautifulSoup
import re
from jinja2 import Environment, FileSystemLoader
import os
import requests


def download_table_of_contents(path):
    user_agent = {'User-agent': 'Spoiler-free TWI Wiki (https://github.com/Uiniel/spoilerfree-twi-wiki)'}
    request = requests.get("https://wanderinginn.com/table-of-contents/", headers=user_agent)
    request.raise_for_status()

    html = request.content.decode("utf-8")

    filename = os.path.join(path, "table_of_contents.html")
    with open(filename, "w", encoding="UTF-8") as f:
        f.write(html)

    return html


def parse_html(html):
    soup = BeautifulSoup(html, "html.parser")

    date_pattern = re.compile(r"https://wanderinginn\.com/(\d{4}/\d{2}/\d{2})/.*/")

    volumes = []

    for parsed_volume in soup.find_all(class_="volume-wrapper"):
        volume_title = parsed_volume.div.div.h2.text
        volume = {
            "title": volume_title,
            "chapters": []
        }
        for parsed_chapter in parsed_volume.select(".body-web a"):
            chapter_title = parsed_chapter.text
            chapter_url = parsed_chapter.get("href")
            chapter_date = re.match(date_pattern, chapter_url).group(1)
            volume["chapters"].append({
                "title": chapter_title,
                "date": chapter_date
            })
        volumes.append(volume)

    return volumes


def generate_html(volumes, path):
    env = Environment(loader=FileSystemLoader("templates"), autoescape=True)
    template = env.get_template("popup.html")
    output = template.render(volumes=volumes)

    filename = os.path.join(path, "extension/popup/chapter_selection.html")
    os.makedirs(os.path.dirname(filename), exist_ok=True)

    with open(filename, "w", encoding="UTF-8") as f:
        print(output, file=f)


def create_popup(path, cached=False):
    html = ""
    if cached:
        print("Using saved table of contents...")
        filename = os.path.join(path, "table_of_contents.html")
        with open(filename, encoding="UTF-8") as f:
            html = f.read()
    else:
        print("Downloading table of contents...")
        html = download_table_of_contents(path)
    print("Parsing html...")
    volumes = parse_html(html)
    print("Generating html...")
    generate_html(volumes, path)
    print("Popup generated!")


if __name__ == "__main__":
    create_popup("out", True)

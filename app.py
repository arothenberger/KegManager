from flask import Flask, abort, send_from_directory

app = Flask(__name__)

STATIC_ASSETS = {
    "style.css",
    "abvCalculator.js",
    "kegManager.js",
    "kegAdd.js",
    "kegEdit.js",
    "recipes.js",
}


@app.get("/")
def index():
    return send_from_directory(app.root_path, "index.html")


@app.get("/<path:asset_path>")
def static_asset(asset_path):
    if asset_path not in STATIC_ASSETS:
        abort(404)
    return send_from_directory(app.root_path, asset_path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)

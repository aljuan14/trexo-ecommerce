import os


def generate_tree(dir_path, ignore_dirs=None, level=0):
    if ignore_dirs is None:
        # DAFTAR FOLDER YANG DIABAIKAN
        # Disesuaikan untuk React, FastAPI, dan Python Virtual Environment
        ignore_dirs = {
            # System & Git
            '.git', '.gitignore', '.DS_Store',
            # Python / FastAPI
            '__pycache__', 'venv', 'env', '.venv', '.pytest_cache',
            # Javascript / React / Next.js
            'node_modules', '.next', 'dist', 'build', 'coverage',
            # Editor config
            '.vscode', '.idea'
        }

    # Ambil list file dan folder
    try:
        items = os.listdir(dir_path)
    except PermissionError:
        return

    # Urutkan agar folder dan file rapi
    items.sort()

    # FILTER DULU sebelum looping
    # Ini penting agar garis pohon (tree lines) tidak putus atau menggantung
    # jika item terakhir ternyata adalah item yang harus di-skip.
    filtered_items = [item for item in items if item not in ignore_dirs]

    for i, item in enumerate(filtered_items):
        path = os.path.join(dir_path, item)
        is_dir = os.path.isdir(path)

        # Print visual tree
        indent = "│   " * level

        # Cek apakah ini item terakhir di dalam list yang sudah difilter
        is_last_item = (i == len(filtered_items) - 1)
        marker = "└── " if is_last_item else "├── "

        print(f"{indent}{marker}{item}")

        # Jika folder, panggil fungsi lagi (rekursif)
        if is_dir:
            generate_tree(path, ignore_dirs, level + 1)


if __name__ == "__main__":
    # Ganti '.' dengan path folder projectmu
    root_path = '.'

    print(f"Project Tree: {os.path.abspath(root_path)}\n")
    generate_tree(root_path)

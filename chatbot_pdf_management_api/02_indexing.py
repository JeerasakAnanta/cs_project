from app.docs_process.process_pdf import process_pdf
import os
from tqdm import tqdm  # install with: pip install tqdm


def list_pdf_files(directory: str):
    return [
        f
        for f in os.listdir(directory)
        if f.endswith(".pdf") and os.path.isfile(os.path.join(directory, f))
    ]


def main():
    print("Start indexing")
    pdf_files = list_pdf_files("./pdfs")
    print(f"Found {len(pdf_files)} PDF(s):")

    for pdf in tqdm(pdf_files, desc="Processing PDFs"):
        print(f"Processing convert PDF to vecter DB: {pdf}")
        process_pdf(os.path.join("pdfs", pdf))


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""Build the Panda PFE report in both PDF and Word from the shared content model."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.dirname(HERE)  # documentation/

PDF_OUT = os.path.join(OUT_DIR, "Rapport_PFE_Panda.pdf")
DOCX_OUT = os.path.join(OUT_DIR, "Rapport_PFE_Panda.docx")


def main(regen_diagrams=False):
    import content
    if regen_diagrams:
        import diagrams
        diagrams.generate_all()
        print("Diagrammes régénérés.")
    blocks = content.get_blocks()
    nfig = sum(1 for b in blocks if b[0] == "figure")
    ntab = sum(1 for b in blocks if b[0] == "table" and b[3])
    import render_pdf
    pages = render_pdf.render(blocks, PDF_OUT)
    import render_docx
    render_docx.render(blocks, DOCX_OUT)
    print(f"Figures: {nfig}  ·  Tableaux numérotés: {ntab}")
    print(f"PDF  : {PDF_OUT}  ({pages} pages, {os.path.getsize(PDF_OUT)//1024} Ko)")
    print(f"DOCX : {DOCX_OUT}  ({os.path.getsize(DOCX_OUT)//1024} Ko)")
    return pages


if __name__ == "__main__":
    regen = "--diagrams" in sys.argv
    main(regen_diagrams=regen)

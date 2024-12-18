import { Injectable } from '@angular/core';
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts }  from 'pdf-lib'

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  private pdfDoc: PDFDocument | undefined
  private pages: PDFPage[] = []
  private currentPage: PDFPage | undefined

  private xAxis = 50
  private yAxis = 800
  private lineHeight = 20

  // A4 sheet size
  private pageWidth = 595
  private pageHeight = 842

  private marginX = 100

  constructor() {
  }

  async createPDF( width: number = this.pageWidth, height: number = this.pageHeight ) {
    this.pdfDoc = await PDFDocument.create()
    this.addNewPage(width, height)
  }

  private addNewPage(width: number = this.pageWidth, height: number = this.pageHeight) {
    if(!this.pdfDoc)
      return
    this.currentPage = this.pdfDoc.addPage([width, height])
    this.pages.push(this.currentPage)
    this.yAxis = height - 50
  }

  private checkPageEnd() {
    if(this.yAxis <=50) {
      this.addNewPage()
    }
  }

  private wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
    const words = text.split(' ')
    const lines: string [] = []
    let currentLine = ''

    for(const word of words) {
      const lineWithWord = currentLine ? `${currentLine} ${word}` : word
      const textWidth = font.widthOfTextAtSize(lineWithWord, fontSize)

      if (textWidth > maxWidth) {
        lines.push(currentLine) 
        currentLine = word
      } else {
        currentLine = lineWithWord
      }
    }

    if(currentLine) {
      lines.push(currentLine)
    }

    return lines

  }

  async drawText(text: string, fontSize: number = 12, color = rgb(0, 0, 0), marginX = this.marginX) {
    if(!this.currentPage || !this.pdfDoc)
      return

    const font = await this.pdfDoc.embedFont(StandardFonts.Helvetica)

    const lines = this.wrapText(text, font, fontSize, (this.pageWidth - 2 * marginX))

    for (const line of lines) {
      this.checkPageEnd()
      this.currentPage.drawText(line, {
        x: this.xAxis,
        y: this.yAxis,
        size: fontSize,
        color,
        font
      })
      this.yAxis -= this.lineHeight
    }


    //this.yAxis -= this.lineHeight
  }

  async drawCategory(category: string, fontSize: number = 14, bgColor = rgb(0.95, 0.6, 0), textColor = rgb(1, 1, 1)) {
    if (!this.currentPage || !this.pdfDoc) return;
  
    const font = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
    this.checkPageEnd();
    const textWidth = font.widthOfTextAtSize(category, fontSize);
    const rectHeight = this.lineHeight + 5;

    this.yAxis = this.yAxis - 15
  
    this.currentPage.drawRectangle({
      x: this.xAxis - 5,
      y: this.yAxis - 5,
      width: this.pageWidth - this.marginX,
      height: rectHeight,
      color: bgColor,
    });
  
    this.currentPage.drawText(category, {
      x: this.xAxis,
      y: this.yAxis,
      size: fontSize,
      color: textColor,
      font,
    });
  
    this.yAxis -= this.lineHeight + 10; // Ajuste de posição
  }
  
  async drawItemTitle(itemTitle: string, fontSize: number = 12, color = rgb(0, 0, 0)) {
    if (!this.currentPage || !this.pdfDoc) return;
  
    const font = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
    this.checkPageEnd();
    this.currentPage.drawText(itemTitle, {
      x: this.xAxis,
      y: this.yAxis,
      size: fontSize,
      color,
      font,
    });
  
    this.yAxis -= this.lineHeight;
  }
  
  async drawItemValue(itemValue: string, fontSize: number = 12, color = rgb(0, 0, 0)) {
    if (!this.currentPage || !this.pdfDoc) return;
  
    const font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
  
    this.checkPageEnd();
    this.currentPage.drawText(itemValue, {
      x: this.xAxis,
      y: this.yAxis,
      size: fontSize,
      color,
      font,
    });
  
    this.yAxis -= this.lineHeight + 5;
  }

  async drawSignature() {

  }

  async drawImg() {

  }

  async saveAndDownload(fileName: string = 'document.pdf') {
    if(!this.pdfDoc)
      return

    const pdfBytes = await this.pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()

    URL.revokeObjectURL(url)
  }

}

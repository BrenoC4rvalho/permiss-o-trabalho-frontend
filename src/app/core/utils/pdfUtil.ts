import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts }  from 'pdf-lib'

export class PdfUtil {

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
  
    this.yAxis -= this.lineHeight + 10; 
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

  async drawImg(imageBytes: Uint8Array, imageType: 'png' | 'jpg', width: number = 100, height: number = 100) {
    if (!this.currentPage || !this.pdfDoc) return;

    let image;
    if (imageType === 'png') {
      image = await this.pdfDoc.embedPng(imageBytes);
    } else {
      image = await this.pdfDoc.embedJpg(imageBytes);
    }

    this.checkPageEnd();

    this.currentPage.drawImage(image, {
      x: this.xAxis,
      y: this.yAxis - height, 
      width,
      height,
    });

    this.yAxis -= height + this.lineHeight;
  }


  // async drawSignature(signatureBase64: string, width: number = 150, height: number = 50) {
  //   if(!this.currentPage || !this.pdfDoc)
  //     return

  //   const signatureBytes = Uint8Array.from(atob(signatureBase64), (char) => char.charCodeAt(0))

  //   this.checkPageEnd()

  //   await this.drawImg(signatureBytes, "png", width, height)
    
  // }

  async drawSignature(signatureBase64: string, width: number = 150, height: number = 50) {
    if (!this.currentPage || !this.pdfDoc) return;
  
    // Converte o base64 para um array de bytes
    const signatureBytes = await fetch(signatureBase64).then((res) => res.arrayBuffer())
  
    // Embeda a imagem no PDF
    const signatureImage = await this.pdfDoc.embedPng(signatureBytes);
  
    // Verifica o fim da página
    this.checkPageEnd();
  
    // Adiciona a imagem da assinatura no PDF
    this.currentPage.drawImage(signatureImage, {
      x: this.xAxis,
      y: this.yAxis - height, // Ajusta a posição vertical
      width: width,
      height: height,
    });
  
    // Ajusta a posição vertical após adicionar a assinatura
    this.yAxis -= height + 20; // Adiciona espaço abaixo da assinatura
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

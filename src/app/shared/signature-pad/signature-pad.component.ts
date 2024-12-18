import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-signature-pad',
  imports: [CommonModule],
  templateUrl: './signature-pad.component.html',
  styleUrl: './signature-pad.component.css'
})
export class SignaturePadComponent {
  showSignatureModal = false
  signatureBase64: string | null = null

  @Output() signatureSaved = new EventEmitter<string>()
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>
  private canvasContext!: CanvasRenderingContext2D

  openSignatureModal() {
    this.showSignatureModal = true
    setTimeout(() => {
      this.initializeCanvas()
    }, 0)
  }

  initializeCanvas() {
    const canvas = this.signatureCanvas.nativeElement
    this.canvasContext = canvas.getContext('2d')!
    this.canvasContext.strokeStyle = 'black'
    this.canvasContext.lineWidth = 2
    
    let isDrawing = false

    canvas.addEventListener('mousedown', () => { isDrawing = true })
    canvas.addEventListener('mouseup', () => { 
      isDrawing = false 
      this.canvasContext.beginPath()
    });
    canvas.addEventListener('mousemove', (event) => {
      if(!isDrawing) return
      this.canvasContext.lineTo(event.offsetX, event.offsetY)
      this.canvasContext.stroke()
    })
    
  }

  clearSignature() {
    const canvas = this.signatureCanvas.nativeElement;
    this.canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  }

  saveSignature() {
    const canvas = this.signatureCanvas.nativeElement;
    this.signatureBase64 = canvas.toDataURL('image/png');
    this.signatureSaved.emit(this.signatureBase64)
    this.showSignatureModal = false;
  }

}

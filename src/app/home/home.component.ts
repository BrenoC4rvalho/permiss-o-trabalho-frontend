import { Component } from '@angular/core';
import { WorkPermitService } from '../core/services/work-permit.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { SignaturePadComponent } from "../shared/signature-pad/signature-pad.component";
import { PdfService } from '../core/services/pdf.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, CdkDropList, CdkDrag, CdkDragPlaceholder, SignaturePadComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  permissionsNumber: string[] = []
  numberPermission: string = ''
  selectedPermission: any | null = null
  groupedItems: any = {}
  visibleCategories: Set<string> = new Set()

  signatureBase64: string | null = null

  constructor(private workPermitService: WorkPermitService, private pdfService: PdfService) {}

  ngOnInit() {
    this.getPermissionsName()
  }

  getPermissionsName() {
    this.workPermitService.getNumberOfPermissions().subscribe((data: string[]) => {
      this.permissionsNumber = data
    })
  }

  findPermissionByNumber() {
    if(this.numberPermission) {
      this.workPermitService.getPermissionByNumber(this.numberPermission).subscribe((data: any[]) => {
        this.selectedPermission = data
        this.groupItemsByCategory(this.selectedPermission.itens)
      })
    } 
  }

  groupItemsByCategory(items: any[]) {
    this.groupedItems = items.reduce((acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = [];
      }
      acc[item.categoria].push(item);
      return acc;
    }, {});
  }

  getCategoryNames() {
    return Object.keys(this.groupedItems);
  }

  isCategoryVisible(category: string) {
    return this.visibleCategories.has(category);
  }

  toggleCategoryVisibility(category: string) {
    if (this.visibleCategories.has(category)) {
      this.visibleCategories.delete(category); 
    } else {
      this.visibleCategories.add(category); 
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    const categories = this.getCategoryNames(); 
    moveItemInArray(categories, event.previousIndex, event.currentIndex);

    const newGroupedItems: any = {};
    categories.forEach((category) => {
      newGroupedItems[category] = this.groupedItems[category];
    });
    this.groupedItems = newGroupedItems;
  }

  hasSignatureCategory() {
    if(this.selectedPermission) {
      return this.selectedPermission.itens.some((item: { categoria: string; }) => item.categoria === 'Assinatura')  
    }

    return false
  }

  hasSignatureSigned(category: string): boolean {
    const signatureField = this.selectedPermission.itens.find((item: { categoria: string; }) => item.categoria === "Assinatura") 
    if(signatureField.valor != null && category === "Assinatura") {
      return true
    }
    return false
  }


  openSignatureModal(signaturePad: SignaturePadComponent) {
    signaturePad.openSignatureModal()
  }

  handleSignatureSaved(signature: string) {
    this.signatureBase64 = signature
    if(this.selectedPermission) {
      const signatureField = this.selectedPermission.itens.find((item: { categoria: string; }) => item.categoria === "Assinatura") 
      signatureField.valor = signature
      console.log(this.selectedPermission)
    }
  }

  async generatePdf() {

    if(!this.selectedPermission) 
      return

    await this.pdfService.createPDF()

    await this.pdfService.drawText('Numero permissao')
    await this.pdfService.drawText(this.selectedPermission.numero_permissao)
    await this.pdfService.drawText('Nome permissao')
    await this.pdfService.drawText(this.selectedPermission.nome_permissao)

    Object.keys(this.groupedItems).forEach((category) => {
       this.pdfService.drawCategory(category)
       this.groupedItems[category].forEach((item: any) => {
          this.pdfService.drawItemTitle(item.item)         
          this.pdfService.drawItemValue(item.valor)         
       })
    })

    
    
    await this.pdfService.saveAndDownload()

  }

}

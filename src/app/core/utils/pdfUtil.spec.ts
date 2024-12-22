import { TestBed } from '@angular/core/testing';

import { PdfUtil } from './pdfUtil';

describe('PdfServiceService', () => {
  let pdfUtil: PdfUtil;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pdfUtil = new PdfUtil();
  });

  it('should be created', () => {
    expect(pdfUtil).toBeTruthy();
  });
});

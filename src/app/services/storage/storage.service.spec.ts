import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';

beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  

describe('StorageService', () => {
  let service: StorageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'fake-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StorageService]
    });

    service = TestBed.inject(StorageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería obtener un signed URL con headers JWT', () => {
    const mockResponse = {
      signedUrl: 'https://signed-url',
      publicUrl: 'https://public-url',
      fileName: 'file.jpg'
    };

    service.getSignedUrl('file.jpg', 'image/jpeg').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(environment.storageSignedUrlEndpoint);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush(mockResponse);
  });

  it('debería subir un archivo con fetch y retornar true en éxito', async () => {
    const file = new File(['contenido'], 'archivo.png', { type: 'image/png' });
  
    (globalThis as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
      } as Response)
    );
  
    const result = await service.uploadFileWithSignedUrl('https://fake-signed-url', file).toPromise();
    expect(result).toBe(true);
  });
  
  it('debería manejar error en fetch y retornar false', async () => {
    const file = new File(['contenido'], 'archivo.png', { type: 'image/png' });
  
    (globalThis as any).fetch = jest.fn(() => Promise.reject('error'));
  
    const result = await service.uploadFileWithSignedUrl('https://fake-url', file).toPromise();
    expect(result).toBe(false);
  });
  

  it('debería manejar error en fetch y retornar false', async () => {
    const file = new File(['contenido'], 'archivo.png', { type: 'image/png' });

    (globalThis as any).fetch = jest.fn().mockImplementation(() => {
        return Promise.reject(new Error('fetch failed'));
      });

    const result = await service.uploadFileWithSignedUrl('https://fake-url', file).toPromise();
    expect(result).toBe(false);
  });

  it('debería realizar todo el flujo: getSignedUrl + fetch', (done) => {
    const file = new File(['contenido'], 'test.png', { type: 'image/png' });

    const signedResponse = {
      signedUrl: 'https://signed-url',
      publicUrl: 'https://public-url',
      fileName: 'test.png'
    };

    // Mock fetch OK
    (globalThis as any).fetch = jest.fn(() => Promise.resolve({ ok: true } as Response));

    service.uploadFile(file).subscribe((url) => {
      expect(url).toBe(signedResponse.publicUrl);
      done();
    });

    const req = httpMock.expectOne(environment.storageSignedUrlEndpoint);
    req.flush(signedResponse);
  });

  it('debería lanzar error si falla uploadFile', (done) => {
    const file = new File(['contenido'], 'test.png', { type: 'image/png' });
  
    const signedResponse = {
      signedUrl: 'https://signed-url',
      publicUrl: 'https://public-url',
      fileName: 'test.png'
    };
  
    // Simula fallo en la subida
    (globalThis as any).fetch = jest.fn(() =>
      Promise.resolve({ ok: false } as Response)
    );
  
    service.uploadFile(file).subscribe({
      next: () => {
        done.fail('Se esperaba un error, pero la llamada fue exitosa');
      },
      error: (err) => {
        expect(err).toBeTruthy();
        expect(err.message).toBe('Failed to upload file');
        done();
      }
    });
  
    const req = httpMock.expectOne(environment.storageSignedUrlEndpoint);
    req.flush(signedResponse);
  });
  
});

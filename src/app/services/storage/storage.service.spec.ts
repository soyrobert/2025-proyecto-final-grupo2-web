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

  describe('getToken', () => {
    it('debería obtener el token del localStorage', () => {
      const token = (service as any).getToken();
      expect(token).toBe('fake-token');
    });

    it('debería retornar una cadena vacía si el token no existe', () => {
      localStorage.removeItem('accessToken');
      const token = (service as any).getToken();
      expect(token).toBe('');
    });
  });

  describe('getHeaders', () => {
    it('debería crear encabezados HTTP con el token JWT', () => {
      const headers = (service as any).getHeaders();
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Authorization')).toBe('Bearer fake-token');
    });
  });

  describe('getSignedUrl', () => {
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
      expect(req.request.body).toEqual({
        fileName: 'file.jpg',
        contentType: 'image/jpeg',
        fileType: undefined
      });
      req.flush(mockResponse);
    });

    it('debería incluir fileType cuando se proporciona', () => {
      const mockResponse = {
        signedUrl: 'https://signed-url',
        publicUrl: 'https://public-url',
        fileName: 'file.jpg'
      };

      service.getSignedUrl('file.jpg', 'image/jpeg', 'profile_pic').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(environment.storageSignedUrlEndpoint);
      expect(req.request.body).toEqual({
        fileName: 'file.jpg',
        contentType: 'image/jpeg',
        fileType: 'profile_pic'
      });
      req.flush(mockResponse);
    });

    it('debería manejar errores al obtener signed URL', (done) => {
      service.getSignedUrl('file.jpg', 'image/jpeg').subscribe({
        next: () => done.fail('No debería llegar aquí'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(environment.storageSignedUrlEndpoint);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('uploadFileWithSignedUrl', () => {
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

      // Verificar que se llamó a fetch con los parámetros correctos
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://fake-signed-url',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'image/png' },
          body: file
        })
      );
    });

    it('debería manejar respuesta con ok=false y retornar false', async () => {
      const file = new File(['contenido'], 'archivo.png', { type: 'image/png' });

      (globalThis as any).fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 403,
        } as Response)
      );

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
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('uploadFile', () => {
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
        expect(console.log).toHaveBeenCalled();
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
          expect(console.error).toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne(environment.storageSignedUrlEndpoint);
      req.flush(signedResponse);
    });

    it('debería manejar error en getSignedUrl', (done) => {
      const file = new File(['contenido'], 'test.png', { type: 'image/png' });

      service.uploadFile(file).subscribe({
        next: () => {
          done.fail('Se esperaba un error, pero la llamada fue exitosa');
        },
        error: (err) => {
          expect(err).toBeTruthy();
          expect(console.error).toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne(environment.storageSignedUrlEndpoint);
      req.error(new ErrorEvent('API error'));
    });
  });

  describe('uploadCsvFile', () => {
    it('debería subir archivo CSV correctamente', (done) => {
      const csvFile = new File(['id,name\n1,test'], 'data.csv', { type: 'text/csv' });

      const signedResponse = {
        signedUrl: 'https://signed-url-csv',
        publicUrl: 'https://public-url-csv',
        fileName: 'data.csv'
      };

      // Mock fetch OK
      (globalThis as any).fetch = jest.fn(() => Promise.resolve({ ok: true } as Response));

      service.uploadCsvFile(csvFile).subscribe((url) => {
        expect(url).toBe(signedResponse.publicUrl);
        done();
      });

      const req = httpMock.expectOne(environment.storageSignedUrlEndpoint);
      expect(req.request.body).toEqual({
        fileName: 'data.csv',
        contentType: 'text/csv',
        fileType: 'csv_import'
      });
      req.flush(signedResponse);
    });

    it('debería manejar error en la subida de CSV', (done) => {
      const csvFile = new File(['id,name\n1,test'], 'data.csv', { type: 'text/csv' });

      const signedResponse = {
        signedUrl: 'https://signed-url-csv',
        publicUrl: 'https://public-url-csv',
        fileName: 'data.csv'
      };

      // Simula fallo en la subida
      (globalThis as any).fetch = jest.fn(() =>
        Promise.resolve({ ok: false } as Response)
      );

      service.uploadCsvFile(csvFile).subscribe({
        next: () => {
          done.fail('Se esperaba un error, pero la llamada fue exitosa');
        },
        error: (err) => {
          expect(err).toBeTruthy();
          expect(err.message).toBe('Failed to upload CSV file');
          done();
        }
      });

      const req = httpMock.expectOne(environment.storageSignedUrlEndpoint);
      req.flush(signedResponse);
    });

    it('debería manejar error al obtener signed URL para CSV', (done) => {
      const csvFile = new File(['id,name\n1,test'], 'data.csv', { type: 'text/csv' });

      service.uploadCsvFile(csvFile).subscribe({
        next: () => {
          done.fail('Se esperaba un error, pero la llamada fue exitosa');
        },
        error: (err) => {
          expect(err).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(environment.storageSignedUrlEndpoint);
      req.error(new ErrorEvent('API error'));
    });
  });
});

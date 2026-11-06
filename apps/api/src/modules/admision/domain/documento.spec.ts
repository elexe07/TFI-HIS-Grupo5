import { Documento, DocumentoInvalido } from './documento';
import { TipoDocumento } from './tipos';

describe('Documento', () => {
  it('debería crearse correctamente con tipo y número válidos', () => {
    const doc = Documento.crear(TipoDocumento.DNI, ' 12345678 ');
    expect(doc.tipo).toBe(TipoDocumento.DNI);
    expect(doc.numero).toBe('12345678');
    expect(doc.toString()).toBe('DNI 12345678');
  });

  it('debería fallar si el número está vacío', () => {
    expect(() => Documento.crear(TipoDocumento.DNI, '   ')).toThrow(DocumentoInvalido);
  });

  it('debería fallar si el tipo es inválido', () => {
    expect(() => Documento.crear('OTRO_INVALIDO' as TipoDocumento, '12345678')).toThrow(
      DocumentoInvalido,
    );
  });

  it('debería fallar si supera los 20 caracteres', () => {
    expect(() => Documento.crear(TipoDocumento.PASAPORTE, 'A'.repeat(21))).toThrow(
      DocumentoInvalido,
    );
  });

  it('debería ser igual a otro con los mismos valores', () => {
    const doc1 = Documento.crear(TipoDocumento.DNI, '12345678');
    const doc2 = Documento.crear(TipoDocumento.DNI, '12345678');
    const doc3 = Documento.crear(TipoDocumento.PASAPORTE, '12345678');

    expect(doc1.equals(doc2)).toBe(true);
    expect(doc1.equals(doc3)).toBe(false);
  });
});


import { ValueObject } from './value-object';

class Punto extends ValueObject<{ x: number; y: number }> {
  constructor(x: number, y: number) {
    super({ x, y });
  }
}

describe('ValueObject', () => {
  it('se compara por sus atributos, no por referencia', () => {
    expect(new Punto(1, 2).equals(new Punto(1, 2))).toBe(true);
    expect(new Punto(1, 2).equals(new Punto(2, 1))).toBe(false);
  });

  it('es inmutable', () => {
    const punto = new Punto(1, 2);
    const props = (punto as unknown as { props: { x: number } }).props;
    expect(() => {
      props.x = 99;
    }).toThrow();
  });
});

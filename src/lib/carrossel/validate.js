export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateCarouselDoc(doc) {
  if (doc.slides[0].layout !== 'cover') throw new ValidationError('Slide 1 deve ser cover');
  if (doc.slides[9].layout !== 'closer') throw new ValidationError('Slide 10 deve ser closer');
  doc.slides.forEach((s, i) => {
    if (s.index !== i + 1) throw new ValidationError(`Slide pos ${i + 1} tem index=${s.index}`);
  });
  const middleLayouts = new Set(doc.slides.slice(1, 9).map((s) => s.layout));
  if (middleLayouts.size < 2) throw new ValidationError('Slides 2-9 precisam de variedade: mínimo 2 layouts');
  let run = 1;
  for (let i = 1; i < doc.slides.length; i++) {
    if (doc.slides[i].layout === doc.slides[i - 1].layout) {
      run++;
      if (run >= 5) throw new ValidationError(`Sequência de ${run} slides "${doc.slides[i].layout}"`);
    } else {
      run = 1;
    }
  }
  doc.slides.forEach((s) => {
    if (s.layout === 'numbered' && !s.number) throw new ValidationError(`Slide ${s.index} é numbered sem number`);
  });
}

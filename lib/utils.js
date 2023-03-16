export const roundTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100

export const coerce = (value) => {
  return !isNaN(+value) ? +value : ['true', 'false'].includes(value) ? Boolean(value) : value;
}

export const pointToFrequency = ({ y }) => {
  const frequency = (100 + y) * 2;

  return frequency;
}
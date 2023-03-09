export const createAction = (type, propsDefinition) => {
  if (propsDefinition) {
    return (props = propsDefinition) => {
      // console.log('props', props)
      // console.log('propsDefinition', propsDefinition)
      const valid = Object.entries((propsDefinition)).every(([k, v]) => {
        console.log('props[k]', props[k])
        return ![null, undefined].includes(props[k]) &&props[k].constructor === v;
      });

      if (!valid) throw new Error(`[Bad props passed to action. Action, Props]: ${type}, ${JSON.stringify(props)}`);

      return { ...props, type };
    }
  }

  else return () => ({ type });
};
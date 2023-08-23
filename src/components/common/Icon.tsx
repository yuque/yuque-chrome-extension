import React, { FC } from 'react';

interface IconProps {
  name: string;
}

const Icon: FC<IconProps> = props => {
  const { name } = props;
  return <img src={`./${name}.png`} alt={name} />;
};

export default Icon;

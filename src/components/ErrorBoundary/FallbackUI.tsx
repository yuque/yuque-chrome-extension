import React from 'react';
import { __i18n } from '@/isomorphic/i18n';

const FallbackUI = ({ errorMessage }) => {
  const imageSrc =
    'https://gw.alipayobjects.com/mdn/prod_resou/afts/img/A*2V7cQIBf7DgAAAAAAAAAAAAAARQnAQ';

  return (
    <div className="module-error">
      <img className="image" src={imageSrc} />
      <div className="error-tip">
        <h3>{__i18n('页面出错了')}</h3>
        <p data-testid="error-boundary-message">
          {errorMessage || __i18n('页面出现问题，请尝试刷新页面')}
        </p>
      </div>
    </div>
  );
};

export default FallbackUI;

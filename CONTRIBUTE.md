# Contribute Guide

## Use svg as asset and svgr component both way
> https://react-svgr.com/docs/webpack/#use-svgr-and-asset-svg-in-the-same-project

```jsx
import svg from './assets/file.svg?url'
import Svg from './assets/file.svg'

const App = () => {
  return (
    <div>
      <img src={svg} width="200" height="200" />
      <Svg width="200" height="200" viewBox="0 0 3500 3500" />
    </div>
  )
}
```

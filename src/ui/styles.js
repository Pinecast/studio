export const button = {
    appearance: 'none',
    background: 'transparent',
    border: '1px solid #fff',
    borderRadius: 4,
    color: '#fff',
    fontFamily: '-apple-system, \'Helvetica Neue\', Helvetica, sans-serif',
    fontSize: '1.25em',
    padding: '15px 30px',
};
const baseButton = {
    background: 'transparent',
    border: '1px solid #fff',
    borderRadius: 3,
    color: '#fff',
    fontSize: '12px',
    fontWeight: 100,
    padding: '0 10px',
};
export const fullButton = {
    ...baseButton,
    justifyContent: 'center',
    display: 'flex',
    width: '100%',
};

const headerItem = {
    lineHeight: '18px',
    marginLeft: 30,
    position: 'relative',
};
export const headerButton = {
    ...baseButton,
    ...headerItem,
    padding: '0 10px',
};
export const headerLabel = {
    ...headerItem,
    border: '1px solid rgba(255, 255, 255, 0.6)',
    borderRadius: 3,
    color: '#ddd',
    fontSize: '12px',
    fontWeight: 100,
    padding: '0 5px',
};
export const headerLabelEmphasis = {
    color: '#fff',
    fontStyle: 'normal',
    fontWeight: 300,
};

export const label = {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    height: '2.5em',
    lineHeight: '1.5em',
};
export const labelText = {
    color: '#fff',
    fontSize: '1em',
    fontWeight: 100,
    marginRight: 10,
};

export const input = {
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 0,
    borderBottom: '1px solid #fff',
    color: '#fff',
    flex: '1 1',
};
export const inputNumber = {
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 0,
    borderBottom: '1px solid #fff',
    color: '#fff',
    fontSize: '1em',
};

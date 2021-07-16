import React from 'react'

export default function Header(props) {
  return (
    <div style={styles.container}>
      <div style={styles.headerContent} onClick={() => props.updateFormState('base')}>
        
        <p style={styles.header}>Car Share App</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: 20,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    maxHeight: 65,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, .1)'
  },
  header: {
    margin: 0,
    fontSize: 24,
    marginLeft: 9,
    fontWeight: '300',
    marginTop: -3,
    color: 'rgba(0, 0, 0, 0.6)',
    cursor: 'pointer',
  },
  headerContent: {
    cursor: 'pointer',
    display: 'flex'
  },
  image: {
    height: 22,
    cursor: 'pointer',
  }
}

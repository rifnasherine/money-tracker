import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [name, setName] = useState('');
  const [datetime, setDatetime] = useState('');
  const [description, setDescription] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    getTransactions();
  }, []);

  async function getTransactions() {
    const url = process.env.REACT_APP_API_URL + '/transactions';
    const response = await fetch(url);
    const data = await response.json();
    setTransactions(data);
  }

  function addNewTransaction(ev) {
    ev.preventDefault();
    const price = name.split(' ')[0];
    
    if (editingTransaction) {
      // Update existing transaction
      updateTransaction(editingTransaction._id);
    } else {
      // Add new transaction
      const url = process.env.REACT_APP_API_URL + '/transaction';
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price,
          name: name.substring(price.length + 1),
          description,
          datetime
        }),
      })
        .then(response => response.json())
        .then(json => {
          setTransactions([...transactions, json]);
          resetForm();
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }

  function updateTransaction(id) {
    const price = name.split(' ')[0];
    const url = process.env.REACT_APP_API_URL + '/transaction/' + id;
    
    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price,
        name: name.substring(price.length + 1),
        description,
        datetime
      }),
    })
      .then(response => response.json())
      .then(updatedTransaction => {
        setTransactions(transactions.map(t => 
          t._id === id ? updatedTransaction : t
        ));
        resetForm();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  function deleteTransaction(id) {
    const url = process.env.REACT_APP_API_URL + '/transaction/' + id;
    
    fetch(url, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(() => {
        setTransactions(transactions.filter(t => t._id !== id));
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  function handleEdit(transaction) {
    setEditingTransaction(transaction);
    setName(transaction.price + ' ' + transaction.name);
    setDescription(transaction.description);
    setDatetime(transaction.datetime);
  }

  function resetForm() {
    setName('');
    setDatetime('');
    setDescription('');
    setEditingTransaction(null);
  }

  let balance = transactions.reduce((sum, transaction) => sum + transaction.price, 0);

  return (
    <main>
      <h1>₹{balance}</h1>
      <form onSubmit={addNewTransaction}>
        <div className='basic'>
          <input
            type="text"
            value={name}
            onChange={ev => setName(ev.target.value)}
            placeholder={'+20000 samsung tv'}
          />
          <input
            type="datetime-local"
            value={datetime}
            onChange={ev => setDatetime(ev.target.value)}
          />
        </div>
        <div className='description'>
          <input
            type="text"
            value={description}
            onChange={ev => setDescription(ev.target.value)}
            placeholder={'description'}
          />
        </div>
        <button type="submit">
          {editingTransaction ? 'Update transaction' : 'Add new transaction'}
        </button>
        {editingTransaction && (
          <button type="button" onClick={resetForm} className="cancel-button">
            Cancel
          </button>
        )}
      </form>
      <div className='transactions'>
        {transactions.length > 0 && transactions.map(transaction => (
          <div key={transaction._id}>
            <div className='transaction'>
              <div className='left'>
                <div className='name'>{transaction.name}</div>
                <div className='description'>{transaction.description}</div>
              </div>
              <div className='right'>
                <div className={"price " + (transaction.price < 0 ? 'red' : 'green')}>
                  {transaction.price}
                </div>
                <div className='datetime'>{transaction.datetime}</div>
                <button 
                  className='edit-button'
                  onClick={() => handleEdit(transaction)}
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
                <button 
                  className='delete-button'
                  onClick={() => deleteTransaction(transaction._id)}
                >
                  <i className="fa-regular fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
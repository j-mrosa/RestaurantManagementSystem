import {Component} from 'react';

class FormPanel extends Component {
  render() {
    const { id, category, description, price, vegetarian } = this.props.selectedItem;
    const { onInputChange, formState, onSubmit, onCancel } = this.props;

    return (
        <form className="mx-auto p-5 border border-secondary border-2" onSubmit={onSubmit}>
          <h3 className="font-weight-bold mb-5">{formState} Item</h3>

          <div className='row'>
            <div className='col-4'>
              <label htmlFor="id" className="form-label">ID</label>
              <input required={true} type="number" className="text-center form-control mb-3" disabled={formState === 'Updating'} name="id" value={id} onChange={onInputChange} />
            </div>
            <div className='col-8'>
              <label htmlFor="category" className="form-label">Category</label>
              <select required={true} className="text-center form-select mb-3" value={category} name="category" onChange={onInputChange} >
                <option id="APP" value="APP">Appetizer</option>
                <option id="BEV" value="BEV">Beverage</option>
                <option id="ENT" value="ENT">Entree</option>
                <option id="DES" value="DES">Dessert</option>
              </select>
            </div>
          </div>

          <div className='row'>
            <label htmlFor="description" className="form-label">Description</label>
            <input required={true} type="text" className="form-control mb-3" name="description" value={description} onChange={onInputChange} />
          </div>

          <div className='row'>
            <div className='col px-5'>
              <label htmlFor="price" className="form-label">Price</label>
              <input required={true} type="number" min="0" className="form-control mb-3" name="price" value={price} onChange={onInputChange} />
            </div>
            <div className='col'>
              <label className="form-label">Is Vegetarian?</label>
              <div className='d-flex justify-content-center text-center'>
                <label className='form-check-label mx-3'>No</label>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" name="vegetarian" checked={vegetarian} onChange={onInputChange} />
                </div>
                <label className='form-check-label mx-2'>Yes</label>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg border-2 border-secondary mt-5 mx-2">Submit</button>
          <button className="btn btn-primary btn-lg border-2 border-secondary mt-5 mx-2" onClick={onCancel}>Cancel</button>
        </form>
    );
  }
}

export default FormPanel;
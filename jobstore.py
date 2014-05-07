from flask import Flask, render_template,jsonify, request, Response
from flask.ext.sqlalchemy import SQLAlchemy
import os
from datetime import datetime

app = Flask(__name__)
app.config['PROPAGATE_EXCEPTIONS'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['OPENSHIFT_POSTGRESQL_DB_URL']
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True

db = SQLAlchemy(app)

class Company(db.Model):
	__tablename__ = 'companies'
	id = db.Column(db.Integer(), primary_key=True)
	name = db.Column(db.String(64), index=True, unique=True, nullable=False)
	description = db.Column(db.Text())
	contact_email = db.Column(db.String(64), unique=True, nullable=False)
	registered_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
	jobs = db.relationship('Job', backref='company')

	def __repr__(self):
		return 'Company %s' % self.name

	def to_json(self):
		company_json = {
			'id' : self.id,
			'name': self.name,
			'contact_email' : self.contact_email,
			'registered_at' : self.registered_at,
			'description' : self.description
		}
		return company_json


	@staticmethod
	def from_json(company_json):
		contact_email = company_json.get('contact_email')
		name = company_json.get('name')
		description = company_json.get('description')
		return Company(contact_email=contact_email, name=name, description=description)

class Job(db.Model):
	__tablename__ = 'jobs'
	id = db.Column(db.Integer(), primary_key=True)
	title = db.Column(db.String(64), index=True, nullable=False)
	description = db.Column(db.Text())
	posted_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
	company_id = db.Column(db.Integer,db.ForeignKey('companies.id'))

	def __repr__(self):
		return 'Job %s' % self.title

	def to_json(self):
		job_json = {
			'id' : self.id,
			'title': self.title,
			'description' : self.description,
			'posted_at' : self.posted_at
		}
		return job_json


	@staticmethod
	def from_json(job_json):
		title = job_json.get('title')
		description = job_json.get('description')
		return Job(title=title, description=description)


@app.route('/')
def index():
	return render_template('index.html')

@app.route('/api/v1/companies', methods=['GET'])
def all_companies():
	companies = Company.query.order_by(Company.name).all()
	return jsonify({'companies':[company.to_json() for company in companies]})

@app.route('/api/v1/companies',methods=['POST'])
def new_company():
	company = Company.from_json(request.json)
	db.session.add(company)
	db.session.commit()
	return jsonify(company.to_json()) , 201

@app.route('/api/v1/companies/<int:company_id>/jobs')
def all_jobs_for_company(company_id):
	company = Company.query.get_or_404(company_id)
	return jsonify({'jobs':[job.to_json() for job in company.jobs]})

@app.route('/api/v1/companies/<int:company_id>/jobs', methods=['POST'])
def post_job_for_company(company_id):
	company = Company.query.get_or_404(company_id)
	job = Job.from_json(request.json)
	job.company = company
	db.session.add(job)
	db.session.commit()
	return jsonify(job.to_json()) , 201

if __name__ == '__main__':
	# db.drop_all()
	# db.create_all()
	app.run(debug=True)
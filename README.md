# OpenShift Cookbook - Chapter 8 Example Application#

A simple Job portal written using Python Flask Framework and PostgreSQL 9.2.

To run it on OpenShift, run the following command.

```
$ rhc create-app jobstore python-2.7 postgresql-9.2 --from-code https://github.com/OpenShift-Cookbook/chapter8-jobstore-python-flask.git
```

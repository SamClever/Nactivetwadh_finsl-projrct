import pymysql

conn = pymysql.connect(host='localhost', user='root', password='12345', database='nactvet_system')
cur = conn.cursor()
for tbl in [
    'accounts_institution', 'accounts_user',
    'institutions', 'users',
    'institution',
    'applications', 'documents', 'payments', 'certificates',
    'inspection_forms', 'inspections', 'form_questions', 'inspection_responses', 'reviews', 'team_members'
]:
    try:
        cur.execute(f'DROP TABLE IF EXISTS {tbl}')
        print('Dropped', tbl)
    except Exception as e:
        print('ERROR dropping', tbl, e)
cur.execute("DELETE FROM django_migrations WHERE app='accounts'")
print('Removed accounts migration history')
conn.commit()
cur.close()
conn.close()

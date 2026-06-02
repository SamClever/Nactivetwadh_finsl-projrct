import pymysql

conn = pymysql.connect(host='localhost', user='root', password='12345', database='nactvet_system')
cur = conn.cursor()
for tbl in ['users', 'institution', 'institutions', 'accounts_user', 'accounts_institution']:
    try:
        cur.execute(f'SHOW CREATE TABLE {tbl}')
        print('---', tbl, '---')
        print(cur.fetchone()[1])
    except Exception as e:
        print('ERROR', tbl, e)
cur.close()
conn.close()

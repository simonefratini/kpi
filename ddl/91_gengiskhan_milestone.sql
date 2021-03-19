CREATE OR REPLACE VIEW gengiskhan_milestone AS
    SELECT 
        v.name AS 'Month',
        p.project_alias AS 'Project',
        p.WBS AS 'WBS',
        p.LOB AS 'LOB',
        p.project_manager AS 'Project Manager',
        p.Site AS 'Site',
        CONCAT('=HYPERLINK("http://monitoring-helpdesk.fimer.com/issues/',
                i.id,
                '","',
                i.id,
                '")') AS 'Milestone Number',
        p.project AS 'Milestone Redmine Project',
        CONVERT( i.subject USING ASCII) AS 'Milestone Name',
        IFNULL(CONCAT(u.lastname, ' ', u.firstname),
                'Not Assigned') AS 'Milestone Owner',
        IFNULL(t.description, '') AS 'Milestone Team Owner',
        CONVERT( i.description USING ASCII) 'Milestone Description',
        s.name AS 'Status',
        i.due_date AS 'Due Date',
        DATE(IF(s.is_closed, i.closed_on, NULL)) AS 'Actual Date',
        CONCAT('=HYPERLINK("http://monitoring-helpdesk.fimer.com/issues/',
                ct.id,
                '","',
                ct.id,
                '")') AS 'Container ID',
        CONVERT( ct.description USING ASCII) AS 'Container'
    FROM
        redmine.issues i
            JOIN
        redmine.issue_statuses s ON i.status_id = s.id
            JOIN
        vproject_custom p ON p.project_id = i.project_id
            LEFT JOIN
        redmine.issues ct ON ct.id = i.parent_id
            AND ct.tracker_id = 4
            LEFT JOIN
        redmine.users u ON u.id = i.assigned_to_id
            LEFT JOIN
        kpi.vteam t ON t.user_id = i.assigned_to_id
            LEFT JOIN
        redmine.versions v ON i.fixed_version_id = v.id
            AND v.project_id = i.project_id
    WHERE
        i.project_id IN (384 , 406)

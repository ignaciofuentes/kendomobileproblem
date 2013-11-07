
Partial Class home2
  Inherits System.Web.UI.Page
  Public VERSION As String = "1.2.0.2"
  Public RELEASE As String = "08/12/2013"

  Dim r As New Random(System.DateTime.Now.Millisecond)


  Protected Sub Page_PreInit(sender As Object, e As System.EventArgs) Handles Me.PreInit
    'VERSION = r.Next.ToString
    'Response.AddHeader("Refresh", Convert.ToString((Session.Timeout * 60) + 5))
  End Sub

End Class
